"""Nó de Execução: aplica a correção e verifica o resultado."""

import subprocess
from sre_agents.state import AgentState

# Comandos/prefixos permitidos (whitelist)
ALLOWED_PREFIXES = [
    "npm ",
    "node ",
    "npx ",
    "psql ",
    "cd ",
    "Set-Location",
    "& ",
    ".\\.ps1",
    ".\\",
    "python ",
    "pip ",
]


def _is_safe_command(cmd: str) -> bool:
    """Verifica se o comando está na whitelist."""
    cmd_clean = cmd.strip()
    if not cmd_clean:
        return False
    # Bloqueia comandos perigosos
    blocked = ["rm ", "del ", "format ", "shutdown", "mkfs", "dd ", "curl |", "wget |"]
    for b in blocked:
        if b in cmd_clean.lower():
            return False
    return any(cmd_clean.startswith(p) or p in cmd_clean for p in ALLOWED_PREFIXES)


def execution_node(state: AgentState) -> dict:
    """
    Executa o comando proposto via subprocess.
    Retorna status: sucesso | falha | abortado
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

    if not _is_safe_command(proposed_solution):
        return {
            "status": "falha",
            "execution_output": f"Comando não permitido pela whitelist: {proposed_solution[:100]}",
        }

    try:
        result = subprocess.run(
            proposed_solution,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120,
            cwd=None,
        )
        stdout = result.stdout or ""
        stderr = result.stderr or ""
        output = f"stdout:\n{stdout}\nstderr:\n{stderr}".strip()
        success = result.returncode == 0

        return {
            "status": "sucesso" if success else "falha",
            "execution_output": output,
        }
    except subprocess.TimeoutExpired:
        return {
            "status": "falha",
            "execution_output": "Timeout: comando excedeu 120 segundos.",
        }
    except Exception as e:
        return {
            "status": "falha",
            "execution_output": f"Erro ao executar: {e}",
        }
