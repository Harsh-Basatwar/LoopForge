"""
LangGraph Workflow: Connects Planner, Analyzer, Coder, Tester, and Reflector in an iterative loop.
"""

from typing import Dict, Any, Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from backend.models.state import AgentState
from backend.agents.planner import plan_task
from backend.agents.analyzer import analyze_repository
from backend.agents.coder import generate_code_solution
from backend.agents.tester import run_tests
from backend.agents.reflector import reflect_on_failures


def decide_next_step(state: AgentState) -> Literal["end", "reflector"]:
    """
    Decides whether to finish or iterate through reflection and self-correction.
    """
    test_results = state.get("test_results") or {}
    iteration = state.get("iteration", 0)
    max_iterations = state.get("max_iterations", 3)

    is_passed = test_results.get("status") == "passed" and test_results.get("failed", 0) == 0

    if is_passed or iteration >= max_iterations:
        return "end"
    
    return "reflector"


def create_agent_graph():
    """
    Construct and compile the LangGraph workflow.
    """
    builder = StateGraph(AgentState)

    # Register nodes
    builder.add_node("planner", plan_task)
    builder.add_node("analyzer", analyze_repository)
    builder.add_node("coder", generate_code_solution)
    builder.add_node("tester", run_tests)
    builder.add_node("reflector", reflect_on_failures)

    # Define edges
    builder.add_edge(START, "planner")
    builder.add_edge("planner", "analyzer")
    builder.add_edge("analyzer", "coder")
    builder.add_edge("coder", "tester")

    # Conditional self-correction loop
    builder.add_conditional_edges(
        "tester",
        decide_next_step,
        {
            "end": END,
            "reflector": "reflector"
        }
    )
    builder.add_edge("reflector", "coder")

    checkpointer = MemorySaver()
    return builder.compile(checkpointer=checkpointer)
