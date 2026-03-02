"""Nó Monitor: detecta erros, filtra logs e dispara o fluxo."""

from sre_agents.state import AgentState
from sre_agents.log_filter import filter_logs


def monitor_node(state: AgentState) -> dict:
    """
    Filtra o log de entrada mantendo apenas linhas relevantes (Error, Exception, Critical).
    Reduz tokens enviados aos próximos agentes.
    """
    raw_log = state.get("raw_log", state.get("error_log", ""))
    if not raw_log:
        return {
            "error_log": "[Monitor] Nenhum log recebido.",
            "status": "erro",
        }

    filtered = filter_logs(raw_log)
    if not filtered:
        filtered = raw_log[:2000]  # Fallback: primeiros 2k chars

    return {
        "error_log": filtered,
        "raw_log": raw_log,
        "conversation": [{"role": "monitor", "message": f"Log filtrado: {len(filtered)} caracteres relevantes."}],
        "status": "filtrado",
    }
