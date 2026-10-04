"""
Task Service: Orchestrates asynchronous execution of the LangGraph workflow,
event streaming (SSE), and human approval gates.
"""

import asyncio
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any, AsyncGenerator
from backend.models.schemas import Task, TaskCreate, AgentEvent, FileChange, TestResult
from backend.models.state import AgentState
from backend.graph.workflow import create_agent_graph
from backend.services.project_service import project_service


class TaskService:
    def __init__(self):
        self._tasks: Dict[str, Task] = {}
        self._events: Dict[str, List[AgentEvent]] = {}
        self._event_queues: Dict[str, List[asyncio.Queue]] = {}
        self._graph = create_agent_graph()

    def create_task(self, task_in: TaskCreate) -> Task:
        task_id = f"task-{uuid.uuid4().hex[:8]}"
        now = datetime.now().isoformat()
        
        task = Task(
            id=task_id,
            project_id=task_in.project_id,
            title=task_in.title,
            description=task_in.description,
            status="planning",
            iteration=0,
            max_iterations=task_in.max_iterations,
            plan=[],
            generated_changes=[],
            test_results=None,
            errors=[],
            created_at=now,
            completed_at=None
        )
        self._tasks[task_id] = task
        self._events[task_id] = []
        self._event_queues[task_id] = []

        # Emit initial event
        self._emit_event(
            task_id=task_id,
            node="workflow",
            status="pending",
            message=f"Initialized workflow for task: {task.title}",
            metadata={"project_id": task.project_id}
        )

        # Trigger execution in the background
        asyncio.create_task(self._run_workflow_async(task_id, auto_approve_plan=task_in.auto_approve_plan))
        return task

    def get_task(self, task_id: str) -> Optional[Task]:
        return self._tasks.get(task_id)

    def list_tasks(self, project_id: Optional[str] = None) -> List[Task]:
        tasks = list(self._tasks.values())
        if project_id:
            tasks = [t for t in tasks if t.project_id == project_id]
        return sorted(tasks, key=lambda t: t.created_at, reverse=True)

    def _emit_event(
        self,
        task_id: str,
        node: str,
        status: str,
        message: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AgentEvent:
        event = AgentEvent(
            id=f"evt-{uuid.uuid4().hex[:8]}",
            task_id=task_id,
            node=node,
            status=status,
            message=message,
            metadata=metadata or {},
            timestamp=datetime.now().strftime("%H:%M:%S")
        )
        self._events.setdefault(task_id, []).append(event)
        
        # Broadcast to all active SSE queues for this task
        for q in self._event_queues.get(task_id, []):
            try:
                q.put_nowait(event)
            except Exception:
                pass

        return event

    async def get_event_stream(self, task_id: str) -> AsyncGenerator[str, None]:
        """SSE generator streaming structured AgentEvents."""
        queue: asyncio.Queue = asyncio.Queue()
        self._event_queues.setdefault(task_id, []).append(queue)

        # First replay all historical events
        for past_evt in self._events.get(task_id, []):
            yield f"data: {past_evt.model_dump_json()}\n\n"

        try:
            while True:
                evt = await queue.get()
                yield f"data: {evt.model_dump_json()}\n\n"
                task = self.get_task(task_id)
                if task and task.status in ["completed", "failed", "cancelled", "awaiting_approval"]:
                    # Keep stream alive for user interaction
                    pass
        except asyncio.CancelledError:
            pass
        finally:
            if task_id in self._event_queues and queue in self._event_queues[task_id]:
                self._event_queues[task_id].remove(queue)

    async def _run_workflow_async(self, task_id: str, auto_approve_plan: bool = True):
        task = self._tasks.get(task_id)
        if not task:
            return

        project = project_service.get_project(task.project_id)
        if not project:
            task.status = "failed"
            self._emit_event(task_id, "workflow", "failed", "Associated project workspace not found")
            return

        initial_state: AgentState = {
            "task_id": task_id,
            "task": task.description or task.title,
            "project_path": project.path,
            "repository_context": {},
            "plan": [],
            "messages": [],
            "generated_changes": [],
            "test_results": None,
            "errors": [],
            "iteration": 0,
            "max_iterations": task.max_iterations,
            "status": "planning",
            "events": [],
            "approved_plan": auto_approve_plan,
            "approved_changes": None
        }

        config = {"configurable": {"thread_id": task_id}}

        try:
            # Stream the LangGraph workflow step by step
            async for step in self._graph.astream(initial_state, config=config, stream_mode="updates"):
                # step is a dict like {"planner": {...}} or {"coder": {...}}
                for node_name, node_update in step.items():
                    if task.status == "cancelled":
                        return

                    # Update task state
                    if "plan" in node_update and node_update["plan"]:
                        task.plan = node_update["plan"]
                    if "generated_changes" in node_update and node_update["generated_changes"]:
                        task.generated_changes = [FileChange(**c) for c in node_update["generated_changes"]]
                    if "test_results" in node_update and node_update["test_results"]:
                        task.test_results = TestResult(**node_update["test_results"])
                    if "iteration" in node_update:
                        task.iteration = node_update["iteration"]
                    if "status" in node_update:
                        task.status = node_update["status"]
                    if "errors" in node_update:
                        task.errors = node_update["errors"]

                    # Emit any new events produced during the node execution
                    for evt in node_update.get("events", []):
                        if not any(e.id == evt["id"] for e in self._events[task_id]):
                            self._emit_event(
                                task_id=task_id,
                                node=evt.get("node", node_name),
                                status=evt.get("status", "running"),
                                message=evt.get("message", ""),
                                metadata=evt.get("metadata", {})
                            )

            # Final check on state
            if task.test_results and task.test_results.status == "passed":
                task.status = "awaiting_approval"
                self._emit_event(
                    task_id=task_id,
                    node="workflow",
                    status="completed",
                    message="All checks passed! Awaiting user review and approval of file diffs.",
                    metadata={"files_changed": len(task.generated_changes)}
                )
            elif task.iteration >= task.max_iterations:
                task.status = "awaiting_approval"
                self._emit_event(
                    task_id=task_id,
                    node="workflow",
                    status="completed",
                    message=f"Reached maximum iterations ({task.max_iterations}). Awaiting user review.",
                    metadata={"iteration": task.iteration}
                )
            else:
                task.status = "completed"
                task.completed_at = datetime.now().isoformat()
                self._emit_event(task_id, "workflow", "completed", "Task workflow completed successfully.")

        except Exception as e:
            task.status = "failed"
            task.completed_at = datetime.now().isoformat()
            self._emit_event(task_id, "workflow", "failed", f"Workflow execution error: {str(e)}")

    def approve_plan(self, task_id: str) -> Task:
        task = self.get_task(task_id)
        if not task:
            raise KeyError("Task not found")
        task.status = "analyzing"
        self._emit_event(task_id, "planner", "completed", "User approved implementation plan.")
        return task

    def approve_changes(self, task_id: str) -> Task:
        task = self.get_task(task_id)
        if not task:
            raise KeyError("Task not found")
        task.status = "completed"
        task.completed_at = datetime.now().isoformat()
        self._emit_event(task_id, "workflow", "completed", "User accepted and applied all code changes.")
        return task

    def reject_changes(self, task_id: str) -> Task:
        task = self.get_task(task_id)
        if not task:
            raise KeyError("Task not found")
        task.status = "failed"
        task.completed_at = datetime.now().isoformat()
        self._emit_event(task_id, "workflow", "failed", "User rejected the proposed code changes.")
        return task

    def cancel_task(self, task_id: str) -> Task:
        task = self.get_task(task_id)
        if not task:
            raise KeyError("Task not found")
        task.status = "cancelled"
        task.completed_at = datetime.now().isoformat()
        self._emit_event(task_id, "workflow", "failed", "Task cancelled by user.")
        return task


task_service = TaskService()
