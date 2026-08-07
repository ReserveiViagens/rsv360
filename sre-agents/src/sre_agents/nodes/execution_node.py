"""Nó de Execução: aplica a correção e verifica o resultado (PR-13c)."""

from sre_agents.state import AgentState
from sre_agents.safe_exec import run_safe_command


def execution_node(state: AgentState) -> dict:
    """
    Executa apenas recipes allowlisted via subprocess shell=False.
    proposed_solution must be `recipe:<id>` or exact allowlisted id.
    """
    approval = state.get("approval", False)
    proposed_solution = state.get("proposed_solution", "").strip()

    if not approval:
        return {
            "status": "abortado",
            "execution_output": "Execução abortada pelo usuário.",
        }

    if not proposed_solution:
        return {
            "status": "falha",
            "execution_output": "Nenhuma solução proposta.",
        }

    success, output = run_safe_command(proposed_solution)
    return {
        "status": "sucesso" if success else "falha",
        "execution_output": output,
    }
