"""Nó Analista: diagnostica a causa raiz do erro."""

from langchain_core.messages import HumanMessage, SystemMessage
from sre_agents.state import AgentState
from sre_agents.llm_factory import get_llm

SYSTEM_PROMPT = """Você é um Analista SRE especializado em diagnóstico de erros em sistemas.
Analise o log de erro fornecido e identifique:
1. Causa raiz do problema
2. Classificação: DB (banco de dados), rede, memória, código, configuração, outro
3. Componente afetado (ex: backend Node.js, PostgreSQL, Redis)
4. Resumo em 2-3 frases para o agente Desenvolvedor propor a correção

Seja conciso. Responda em português."""


def diagnostic_node(state: AgentState) -> dict:
    """Usa LLM para analisar o log e gerar diagnóstico."""
    error_log = state.get("error_log", "")
    if not error_log:
        return {
            "diagnosis": "[Analista] Nenhum log para analisar.",
            "status": "erro",
        }

    llm = get_llm(temperature=0.1)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Log de erro:\n\n{error_log}"),
    ]
    response = llm.invoke(messages)
    diagnosis = response.content if hasattr(response, "content") else str(response)

    return {
        "diagnosis": diagnosis,
        "conversation": [{"role": "analista", "message": diagnosis}],
        "status": "analisado",
    }
