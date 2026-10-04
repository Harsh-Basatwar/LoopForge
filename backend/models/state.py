"""
LangGraph state definitions for the AI Software Engineering Assistant.
"""

from typing import TypedDict, List, Dict, Any, Optional, Annotated
from langgraph.graph.message import AnyMessage, add_messages


class AgentState(TypedDict):
    """
    Structured state of the Software Engineering Assistant graph.
    """
    task_id: str
    task: str
    project_path: str
    repository_context: Dict[str, Any]
    plan: List[str]
    messages: Annotated[List[AnyMessage], add_messages]
    generated_changes: List[Dict[str, Any]]
    test_results: Optional[Dict[str, Any]]
    errors: List[str]
    iteration: int
    max_iterations: int
    status: str
    events: List[Dict[str, Any]]
    approved_plan: bool
    approved_changes: Optional[bool]
