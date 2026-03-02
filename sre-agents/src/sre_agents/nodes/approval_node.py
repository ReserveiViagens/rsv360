"""Nó de Aprovação: human-in-the-loop via interrupt()."""

from typing import Literal
from langgraph.types import interrupt, Command
from langgraph.graph import END
from sre_agents.state import AgentState


def approval_node(state: AgentState) -> Command[Literal["executar"]]:
    """
    Pausa e aguarda aprovação humana. O valor retornado por interrupt()
    é injetado via Command(resume=True/False) quando o humano retoma.
    """
    proposed_solution = state.get("proposed_solution", "")
    diagnosis = state.get("diagnosis", "")

    payload = {
        "question": "Identifiquei o erro e proponho a seguinte correção. Posso prosseguir?",
        "diagnosis": diagnosis[:500],
        "proposed_solution": proposed_solution,
        "approve_prompt": "Envie Command(resume=True) para aprovar ou Command(resume=False) para rejeitar.",
    }

    is_approved = interrupt(payload)

    if is_approved:
        return Command(update={"approval": True}, goto="executar")
    return Command(update={"approval": False, "status": "abortado"}, goto=END)
