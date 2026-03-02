"""Entry point do sistema de agentes SRE."""

import os
import sys

# Adiciona src ao path para imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from dotenv import load_dotenv

load_dotenv()

from sre_agents.graph import get_app
from langgraph.types import Command


def run_with_log(log_text: str, thread_id: str = "default"):
    """
    Executa o fluxo com um log de erro.
    Retorna o estado após interrupção ou conclusão.
    """
    app = get_app()
    config = {"configurable": {"thread_id": thread_id}}

    initial_state = {
        "raw_log": log_text,
        "error_log": "",
        "status": "iniciando",
        "attempts": 0,
        "approval": False,
    }

    result = app.invoke(initial_state, config=config)
    return result, config


def resume(thread_id: str, approved: bool):
    """Retoma o fluxo após aprovação humana."""
    app = get_app()
    config = {"configurable": {"thread_id": thread_id}}
    result = app.invoke(Command(resume=approved), config=config)
    return result


if __name__ == "__main__":
    # Exemplo de uso
    sample_log = """
    2026-01-30 10:43:26 info: Database pool connected successfully
    2026-01-30 10:43:26 error: Unexpected error on idle client (pool continua ativo): connection timeout
    2026-01-30 10:45:01 info: Starting OTA sync for 0 connections
    2026-01-30 10:45:01 error: Unhandled Rejection - reason: ECONNREFUSED
    """
    print("Executando fluxo com log de exemplo...")
    result, config = run_with_log(sample_log)
    print("Estado:", result.get("status"), result.get("proposed_solution", "")[:100])
    if "__interrupt__" in result:
        print("Aguardando aprovação. Use: python cli.py approve", config["configurable"]["thread_id"])
