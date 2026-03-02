"""CLI para executar o fluxo de agentes SRE e aprovar/rejeitar."""

import argparse
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "src"))

from dotenv import load_dotenv

load_dotenv()


def cmd_run(args):
    """Executa o fluxo com log do arquivo ou stdin."""
    from main import run_with_log

    if args.file:
        with open(args.file, "r", encoding="utf-8", errors="replace") as f:
            log_text = f.read()
    elif args.log:
        log_text = args.log
    else:
        log_text = sys.stdin.read()

    thread_id = args.thread_id or "sre-" + str(os.getpid())
    result, config = run_with_log(log_text, thread_id=thread_id)

    print(f"Thread ID: {thread_id}")
    print(f"Status: {result.get('status', 'N/A')}")

    if result.get("diagnosis"):
        print(f"\nDiagnóstico:\n{result['diagnosis'][:500]}...")
    if result.get("proposed_solution"):
        print(f"\nSolução proposta:\n{result['proposed_solution']}")

    if "__interrupt__" in result:
        print("\n--- AGUARDANDO APROVAÇÃO ---")
        print(f"Para aprovar: python cli.py approve {thread_id}")
        print(f"Para rejeitar: python cli.py reject {thread_id}")
    else:
        print(f"\nResultado: {result.get('status', 'concluído')}")
        if result.get("execution_output"):
            print(f"Saída: {result['execution_output'][:300]}...")


def cmd_approve(args):
    """Aprova e retoma o fluxo."""
    from main import resume

    result = resume(args.thread_id, approved=True)
    print("Aprovado. Executando correção...")
    print(f"Status final: {result.get('status', 'N/A')}")
    if result.get("execution_output"):
        print(f"Saída da execução:\n{result['execution_output']}")


def cmd_reject(args):
    """Rejeita e encerra o fluxo."""
    from main import resume

    result = resume(args.thread_id, approved=False)
    print("Rejeitado. Fluxo encerrado.")
    print(f"Status: {result.get('status', 'abortado')}")


def main():
    parser = argparse.ArgumentParser(description="SRE Agents - Agentes de IA para monitoramento")
    subparsers = parser.add_subparsers(dest="command", help="Comando")

    # run
    p_run = subparsers.add_parser("run", help="Executar fluxo com log de erro")
    p_run.add_argument("-f", "--file", help="Arquivo de log")
    p_run.add_argument("-l", "--log", help="Texto do log (inline)")
    p_run.add_argument("-t", "--thread-id", help="ID da thread para retomar depois")
    p_run.set_defaults(func=cmd_run)

    # approve
    p_approve = subparsers.add_parser("approve", help="Aprovar e executar correção")
    p_approve.add_argument("thread_id", help="ID da thread (ex: sre-12345)")
    p_approve.set_defaults(func=cmd_approve)

    # reject
    p_reject = subparsers.add_parser("reject", help="Rejeitar correção")
    p_reject.add_argument("thread_id", help="ID da thread")
    p_reject.set_defaults(func=cmd_reject)

    args = parser.parse_args()
    if args.command:
        args.func(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
