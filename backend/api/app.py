"""
FastAPI Server for the AI Software Engineering Assistant.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from typing import List, Optional

from backend.models.schemas import (
    Project, ProjectCreate, FileNode,
    Task, TaskCreate, AgentEvent, FileChange, TestResult
)
from backend.services.project_service import project_service
from backend.services.task_service import task_service

app = FastAPI(
    title="AI Software Engineering Assistant API",
    description="Backend API powered by LangGraph self-correcting agent workflow",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "ai-software-engineering-assistant"}


# --- Projects API ---

@app.post("/api/projects", response_model=Project)
def create_project(project_in: ProjectCreate):
    return project_service.create_project(project_in)


@app.get("/api/projects", response_model=List[Project])
def list_projects():
    return project_service.list_projects()


@app.get("/api/projects/{project_id}", response_model=Project)
def get_project(project_id: str):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.get("/api/projects/{project_id}/files")
def get_project_files(project_id: str):
    tree = project_service.get_file_tree(project_id)
    return {"files": tree}


@app.get("/api/projects/{project_id}/files/{file_path:path}")
def get_project_file_content(project_id: str, file_path: str):
    try:
        content = project_service.get_file_content(project_id, file_path)
        return {"path": file_path, "content": content}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- Tasks API ---

@app.post("/api/tasks", response_model=Task)
async def create_task(task_in: TaskCreate):
    project = project_service.get_project(task_in.project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return task_service.create_task(task_in)


@app.get("/api/tasks", response_model=List[Task])
async def list_tasks(project_id: Optional[str] = Query(None)):
    return task_service.list_tasks(project_id=project_id)


@app.get("/api/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.post("/api/tasks/{task_id}/approve-plan", response_model=Task)
async def approve_plan(task_id: str):
    try:
        return task_service.approve_plan(task_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.post("/api/tasks/{task_id}/approve-changes", response_model=Task)
async def approve_changes(task_id: str):
    try:
        return task_service.approve_changes(task_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.post("/api/tasks/{task_id}/reject-changes", response_model=Task)
async def reject_changes(task_id: str):
    try:
        return task_service.reject_changes(task_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.post("/api/tasks/{task_id}/cancel", response_model=Task)
async def cancel_task(task_id: str):
    try:
        return task_service.cancel_task(task_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.get("/api/tasks/{task_id}/events")
async def stream_task_events(task_id: str):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return EventSourceResponse(
        task_service.get_event_stream(task_id),
        media_type="text/event-stream"
    )


@app.get("/api/tasks/{task_id}/diff")
def get_task_diff(task_id: str):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    combined_diff = "\n".join([c.diff for c in task.generated_changes if c.diff])
    return {
        "task_id": task_id,
        "files_changed": [c.path for c in task.generated_changes],
        "diff": combined_diff,
        "changes": task.generated_changes
    }


@app.get("/api/tasks/{task_id}/tests")
def get_task_tests(task_id: str):
    task = task_service.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task_id": task_id, "test_results": task.test_results}
