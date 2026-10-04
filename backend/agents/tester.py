"""
Test Agent: Executes tests safely using ExecutionManager and produces structured test reports.
"""

import os
from typing import Dict, Any, List
from datetime import datetime
from backend.models.state import AgentState
from backend.execution.manager import ExecutionManager
from backend.tools.repo_tools import list_files


def run_tests(state: AgentState) -> Dict[str, Any]:
    """
    Run pytest or code execution checks on the workspace.
    """
    project_path = state.get("project_path", "")
    iteration = state.get("iteration", 1)
    events = list(state.get("events", []))
    errors = list(state.get("errors", []))

    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "tester",
        "status": "running",
        "message": "Running automated test suite in execution sandbox...",
        "metadata": {"path": project_path},
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    exec_mgr = ExecutionManager(timeout_seconds=15)
    
    # Check if there are test files in project
    all_files = list_files(project_path)
    test_files = [f["path"] for f in all_files if "test" in f["path"].lower() and f["path"].endswith(".py")]

    if test_files:
        test_res = exec_mgr.run_pytest(cwd=project_path)
    else:
        # Check generated code directly via execution check
        changes = state.get("generated_changes", [])
        code_to_check = changes[0]["content"] if changes else ""
        test_res = exec_mgr.check_python_code(code_to_check)

    is_success = test_res.get("status") == "passed" and test_res.get("failed", 0) == 0
    
    if is_success:
        events.append({
            "id": f"evt-{len(events) + 1}",
            "task_id": state["task_id"],
            "node": "tester",
            "status": "completed",
            "message": f"Tests passed successfully ({test_res.get('passed', 0)}/{test_res.get('total', 1)} passed)",
            "metadata": {
                "passed": test_res.get("passed", 0),
                "failed": 0,
                "duration_ms": test_res.get("duration_ms", 0)
            },
            "timestamp": datetime.now().strftime("%H:%M:%S")
        })
        new_status = "awaiting_approval"
    else:
        fail_msg = f"{test_res.get('failed', 1)} test(s) failed"
        errors.append(f"Test failure (Iteration {iteration}):\n{test_res.get('output', 'Unknown error')}")
        events.append({
            "id": f"evt-{len(events) + 1}",
            "task_id": state["task_id"],
            "node": "tester",
            "status": "failed",
            "message": fail_msg,
            "metadata": {
                "passed": test_res.get("passed", 0),
                "failed": test_res.get("failed", 1),
                "duration_ms": test_res.get("duration_ms", 0),
                "output": test_res.get("output", "")[:500]
            },
            "timestamp": datetime.now().strftime("%H:%M:%S")
        })
        new_status = "debugging"

    return {
        "test_results": test_res,
        "errors": errors,
        "status": new_status,
        "events": events
    }
