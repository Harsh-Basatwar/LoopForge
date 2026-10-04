"""
Reflection / Debug Agent: Analyzes failures, diagnoses root cause, and provides corrective guidance.
"""

from typing import Dict, Any
from datetime import datetime
from backend.models.state import AgentState
from backend.agents.llm_factory import get_llm
from langchain_core.messages import SystemMessage, HumanMessage


def reflect_on_failures(state: AgentState) -> Dict[str, Any]:
    """
    Diagnose test failures and generate specific, actionable corrective instructions.
    """
    iteration = state.get("iteration", 1)
    errors = state.get("errors", [])
    latest_error = errors[-1] if errors else "General execution error"
    events = list(state.get("events", []))

    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "reflector",
        "status": "running",
        "message": f"Analyzing failure logs from iteration {iteration}...",
        "metadata": {"iteration": iteration},
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    diagnosis = ""
    llm = get_llm()
    if llm:
        try:
            prompt = (
                f"The prior solution failed tests with this error output:\n"
                f"```\n{latest_error[:2000]}\n```\n"
                f"Analyze this error. In 2-3 concise sentences: (1) diagnose what went wrong and (2) specify the exact code fix required."
            )
            res = llm.invoke([
                SystemMessage(content="You are a senior debugging engineer. Provide concise, direct root cause analysis and fixes."),
                HumanMessage(content=prompt)
            ])
            diagnosis = res.content.strip()
        except Exception:
            pass

    if not diagnosis:
        diagnosis = (
            f"The implementation failed assertions or checks in iteration {iteration}. "
            f"Review edge case handling, return types, and import dependencies to align with test expectations."
        )

    # Append refined reflection message to errors list for Coder
    errors.append(f"Reflection Diagnosis (Iteration {iteration}): {diagnosis}")

    events.append({
        "id": f"evt-{len(events) + 1}",
        "task_id": state["task_id"],
        "node": "reflector",
        "status": "completed",
        "message": f"Diagnosed failure: {diagnosis[:120]}...",
        "metadata": {
            "diagnosis": diagnosis,
            "iteration": iteration
        },
        "timestamp": datetime.now().strftime("%H:%M:%S")
    })

    return {
        "errors": errors,
        "status": "coding",
        "events": events
    }
