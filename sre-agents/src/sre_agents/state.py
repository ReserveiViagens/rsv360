"""Definição do estado do grafo de agentes SRE."""

import operator
from typing import Annotated, TypedDict


class AgentState(TypedDict, total=False):
    """Estado compartilhado entre os agentes Monitor, Analista e Desenvolvedor."""

    error_log: str
    raw_log: str
    diagnosis: str
    proposed_solution: str
    conversation: Annotated[list, operator.add]
    status: str
    attempts: int
    approval: bool
    execution_output: str
    thread_id: str
