"""Montagem do StateGraph com os agentes Monitor, Analista e Desenvolvedor."""

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START, END
from langgraph.types import Command

from sre_agents.state import AgentState
from sre_agents.nodes.monitor_node import monitor_node
from sre_agents.nodes.diagnostic_node import diagnostic_node
from sre_agents.nodes.proposal_node import proposal_node
from sre_agents.nodes.approval_node import approval_node
from sre_agents.nodes.execution_node import execution_node

MAX_ATTEMPTS = 3


def route_after_execution(state: AgentState) -> str:
    """Roteia após execução: sucesso/abortado -> END, falha -> propor (retry)."""
    status = state.get("status", "falha")
    attempts = state.get("attempts", 0)

    if status == "sucesso" or status == "abortado":
        return "__end__"
    if attempts < MAX_ATTEMPTS:
        return "propor"
    return "__end__"


def build_graph(checkpointer=None):
    """
    Constrói e compila o grafo de agentes SRE.
    Usa MemorySaver por padrão para persistir estado entre interrupções.
    """
    if checkpointer is None:
        checkpointer = MemorySaver()

    workflow = StateGraph(AgentState)

    workflow.add_node("monitor", monitor_node)
    workflow.add_node("analista", diagnostic_node)
    workflow.add_node("propor", proposal_node)
    workflow.add_node("aprovar", approval_node)
    workflow.add_node("executar", execution_node)

    workflow.add_edge(START, "monitor")
    workflow.add_edge("monitor", "analista")
    workflow.add_edge("analista", "propor")
    workflow.add_edge("propor", "aprovar")
    workflow.add_conditional_edges("executar", route_after_execution)

    return workflow.compile(checkpointer=checkpointer)


def get_app():
    """Retorna o grafo compilado pronto para uso."""
    return build_graph()
