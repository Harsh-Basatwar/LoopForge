"""
Pydantic schemas for the AI Software Engineering Assistant.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class ProjectBase(BaseModel):
    name: str
    path: str
    language: Optional[str] = "python"
    framework: Optional[str] = "vanilla"


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: str
    created_at: str
    file_count: int = 0


class FileNode(BaseModel):
    name: str
    path: str
    is_dir: bool
    size: Optional[int] = None
    children: Optional[List['FileNode']] = None


class FileChange(BaseModel):
    path: str
    change_type: str = "modify"  # "create" | "modify" | "delete"
    content: str = ""
    diff: str = ""
    description: Optional[str] = None


class TestResult(BaseModel):
    command: str = ""
    exit_code: int = 0
    status: str = "passed"  # "passed" | "failed" | "error"
    passed: int = 0
    failed: int = 0
    total: int = 0
    output: str = ""
    duration_ms: int = 0


class AgentEvent(BaseModel):
    id: str
    task_id: str
    node: str  # "planner" | "analyzer" | "coder" | "tester" | "reflector" | "workflow"
    status: str  # "pending" | "running" | "completed" | "failed"
    message: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str


class TaskCreate(BaseModel):
    project_id: str
    title: str
    description: str
    auto_approve_plan: bool = True
    max_iterations: int = 3


class Task(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    status: str = "planning"  # "planning" | "analyzing" | "coding" | "testing" | "debugging" | "awaiting_plan_approval" | "awaiting_approval" | "completed" | "failed" | "cancelled"
    iteration: int = 0
    max_iterations: int = 3
    plan: List[str] = Field(default_factory=list)
    generated_changes: List[FileChange] = Field(default_factory=list)
    test_results: Optional[TestResult] = None
    errors: List[str] = Field(default_factory=list)
    created_at: str
    completed_at: Optional[str] = None
