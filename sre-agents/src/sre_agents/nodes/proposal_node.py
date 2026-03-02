"""Nó Desenvolvedor: propõe script ou comando de correção."""

from langchain_core.messages import HumanMessage, SystemMessage
from sre_agents.state import AgentState
from sre_agents.llm_factory import get_llm

SYSTEM_PROMPT = """Você é um Desenvolvedor SRE especializado em correções de sistemas.
Com base no diagnóstico fornecido, proponha UM comando ou script para corrigir o problema.

Contexto do sistema RSV360:
- Backend Node.js na porta 5000
- Backend Admin na porta 5002
- Site público Next.js na porta 3000
- Dashboard Turismo na porta 3005
- PostgreSQL na porta 5433
- Microserviços nas portas 6000-6031

Regras:
1. Proponha apenas comandos seguros: npm, node, psql, scripts .ps1 do projeto
2. Para reiniciar serviços: use os scripts existentes em scripts/ ou Iniciar Sistema Completo.ps1
3. Para erros de banco: considere migrations, conexão, senhas
4. Para erros de porta em uso: libere a porta antes de reiniciar
5. Responda APENAS com o comando/script, sem explicação longa
6. Use PowerShell (.ps1) no Windows
7. Se for um script, forneça o caminho e argumentos necessários

Formato da resposta: comece com o comando exato a ser executado."""


def proposal_node(state: AgentState) -> dict:
    """Usa LLM para gerar proposta de correção."""
    diagnosis = state.get("diagnosis", "")
    error_log = state.get("error_log", "")
    attempts = state.get("attempts", 0)
    execution_output = state.get("execution_output", "")

    if not diagnosis:
        return {
            "proposed_solution": "[Desenvolvedor] Nenhum diagnóstico disponível.",
            "status": "erro",
        }

    context = f"Diagnóstico:\n{diagnosis}\n\nLog relevante:\n{error_log[:1500]}"
    if execution_output and attempts > 0:
        context += f"\n\nTentativa anterior falhou. Saída:\n{execution_output}"

    llm = get_llm(temperature=0.2)
    messages = [
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=context),
    ]
    response = llm.invoke(messages)
    solution = response.content if hasattr(response, "content") else str(response)

    # Extrair apenas o comando (primeira linha que parece comando)
    lines = solution.strip().split("\n")
    cmd = solution
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#") and not line.startswith("```"):
            if any(
                x in line.lower()
                for x in ["npm", "node", "psql", ".ps1", "cd ", "Set-Location", "& "]
            ):
                cmd = line
                break

    return {
        "proposed_solution": cmd,
        "attempts": attempts + 1,
        "conversation": [{"role": "desenvolvedor", "message": solution}],
        "status": "aguardando_aprovacao",
    }
