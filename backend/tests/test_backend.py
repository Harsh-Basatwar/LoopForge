"""
Unit and integration tests for the AI Software Engineering Assistant backend.
"""

import pytest
import os
from backend.execution.manager import ExecutionManager
from backend.tools.repo_tools import list_files, read_file, write_file, build_file_tree, detect_project_metadata
from backend.services.project_service import project_service
from backend.services.task_service import task_service
from backend.models.schemas import TaskCreate


def test_execution_manager_python_code():
    mgr = ExecutionManager(timeout_seconds=5)
    
    # Valid code
    res = mgr.check_python_code("def add(a, b): return a + b\nassert add(2, 3) == 5")
    assert res["status"] == "passed"
    assert res["exit_code"] == 0

    # Syntax error
    res_err = mgr.check_python_code("def broken(: pass")
    assert res_err["status"] == "failed"
    assert "SyntaxError" in res_err["output"]

    # Runtime error
    res_rt = mgr.check_python_code("assert 2 + 2 == 5")
    assert res_rt["status"] == "failed"
    assert "AssertionError" in res_rt["output"]


def test_repo_tools_and_tree(tmp_path):
    # Create test files
    p1 = tmp_path / "hello.py"
    p1.write_text("print('hello')")
    
    sub = tmp_path / "sub"
    sub.mkdir()
    p2 = sub / "world.py"
    p2.write_text("print('world')")

    files = list_files(str(tmp_path))
    assert len(files) == 2
    paths = [f["path"] for f in files]
    assert "hello.py" in paths
    assert os.path.join("sub", "world.py") in paths

    tree = build_file_tree(str(tmp_path))
    assert len(tree) >= 1

    content = read_file(str(tmp_path), "hello.py")
    assert content == "print('hello')"

    mod = write_file(str(tmp_path), "hello.py", "print('hello universe')")
    assert mod["change_type"] == "modify"
    assert "+print('hello universe')" in mod["diff"]


def test_project_service_defaults():
    projects = project_service.list_projects()
    assert len(projects) >= 1
    proj_ids = [p.id for p in projects]
    assert "proj-fibonacci" in proj_ids


@pytest.mark.asyncio
async def test_task_workflow_execution():
    projects = project_service.list_projects()
    proj = projects[0]

    task_in = TaskCreate(
        project_id=proj.id,
        title="Verify Fibonacci implementation",
        description="Check that Fibonacci algorithm correctly handles edge cases and runs tests.",
        auto_approve_plan=True,
        max_iterations=2
    )

    task = task_service.create_task(task_in)
    assert task.id.startswith("task-")
    assert task.status in ["planning", "analyzing", "coding", "testing", "completed", "awaiting_approval"]
