"""
Planner Agent: Analyzes the task and produces a structured implementation plan.
"""

from typing import Dict, Any, List
from datetime import datetime
from backend.models.state import AgentState
from backend.agents.llm_factory import get_llm
from langchain_core.messages import SystemMessage, HumanMessage


def plan_task(state: AgentState) -> Dict[str, Any]:
    """
    Generate an actionable multi-step implementation plan.
    """
    task = state["task"]
    repo_context = state.get("repository_context", {})
    files = repo_context.get("files", [])
    language = repo_context.get("language", "python")

    events = list(state.get("events", []))
    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "planner",
        "status": "running",
        "message": "Generating implementation plan...",
        "metadata": {"task": task},
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    llm = get_llm()
    plan: List[str] = []

    if llm:
        try:
            prompt = (
                f"You are a Senior Software Architect. Create a concise, 3 to 5 step implementation plan "
                f"for the following task in a {language} codebase.\n"
                f"Available files: {', '.join(files[:10])}\n"
                f"Task: {task}\n\n"
                f"Format output as a numbered list where each line starts with '1. ', '2. ', etc."
            )
            response = llm.invoke([
                SystemMessage(content="You produce clear, engineering-focused implementation plans."),
                HumanMessage(content=prompt)
            ])
            lines = response.content.splitlines()
            for line in lines:
                clean = line.strip()
                if clean and clean[0].isdigit() and ("." in clean or ")" in clean):
                    parts = clean.split(".", 1) if "." in clean else clean.split(")", 1)
                    plan.append(parts[1].strip())
        except Exception:
            pass

    # Heuristic fallback if LLM not present or returned empty
    if not plan:
        task_lower = task.lower()
        if "fibonacci" in task_lower or "math" in task_lower:
            plan = [
                "Inspect existing math utilities and test coverage in the repository",
                "Implement or enhance the Fibonacci algorithm with input validation",
                "Add edge case handling for zero, negative numbers, and large indices",
                "Execute the test suite to verify correctness and performance",
                "Prepare unified diff and confirm all unit tests pass"
            ]
        elif "palindrome" in task_lower:
            plan = [
                "Inspect existing palindrome functions and string handling utilities",
                "Normalize strings by stripping punctuation, symbols, and casing",
                "Implement robust two-pointer or slice symmetry validation",
                "Run test suite across standard and sentence-length test fixtures",
                "Verify final output and generate file change diff"
            ]
        else:
            plan = [
                f"Analyze target codebase structure and identify primary module for '{task[:35]}'",
                "Design and construct modular implementation addressing requirements",
                "Implement comprehensive test cases covering edge cases",
                "Execute test suite to validate functionality and catch regressions",
                "Review diff and prepare final change summary"
            ]

    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "planner",
        "status": "completed",
        "message": f"Generated {len(plan)}-step implementation plan",
        "metadata": {"steps_count": len(plan), "plan": plan},
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    return {
        "plan": plan,
        "status": "analyzing",
        "events": events
    }
