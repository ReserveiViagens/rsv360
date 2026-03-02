"""Filtragem de logs para reduzir tokens enviados à IA."""

import re
from typing import Optional

# Padrões que indicam erro/crítico
ERROR_PATTERNS = [
    r"\bError\b",
    r"\bERROR\b",
    r"\bException\b",
    r"\bEXCEPTION\b",
    r"\bCritical\b",
    r"\bCRITICAL\b",
    r"\bFATAL\b",
    r"\bFatal\b",
    r"\bfailed\b",
    r"\bFailed\b",
    r"\bFAILED\b",
    r"\bcrash\b",
    r"\bCrash\b",
    r"\bunhandledRejection\b",
    r"\buncaughtException\b",
    r"\bprocess\.exit\b",
    r"\bEADDRINUSE\b",
    r"\bECONNREFUSED\b",
    r"\bETIMEDOUT\b",
    r"\bpassword authentication failed\b",
    r"\bdatabase .* does not exist\b",
]

# Regex compilado para performance
_COMPILED = [re.compile(p, re.IGNORECASE) for p in ERROR_PATTERNS]

# Limite de linhas relevantes para enviar ao LLM
DEFAULT_MAX_LINES = 50

# Contexto: linhas antes/depois de uma linha de erro
CONTEXT_LINES_BEFORE = 2
CONTEXT_LINES_AFTER = 5


def _matches_error(line: str) -> bool:
    """Verifica se a linha contém algum padrão de erro."""
    return any(rx.search(line) for rx in _COMPILED)


def filter_logs(
    raw_log: str,
    max_lines: int = DEFAULT_MAX_LINES,
    include_context: bool = True,
) -> str:
    """
    Filtra o log mantendo apenas linhas relevantes (erros, exceções, críticos).
    Reduz o tamanho do contexto para economizar tokens.

    Args:
        raw_log: Log completo em texto
        max_lines: Máximo de linhas a retornar
        include_context: Se True, inclui linhas antes/depois de cada erro

    Returns:
        Log filtrado
    """
    lines = raw_log.strip().split("\n")
    if not lines:
        return ""

    # Encontrar índices das linhas que contêm erro
    error_indices = set()
    for i, line in enumerate(lines):
        if _matches_error(line):
            error_indices.add(i)
            if include_context:
                for j in range(
                    max(0, i - CONTEXT_LINES_BEFORE),
                    min(len(lines), i + CONTEXT_LINES_AFTER + 1),
                ):
                    error_indices.add(j)

    # Ordenar e limitar
    selected = sorted(error_indices)
    if len(selected) > max_lines:
        selected = selected[-max_lines:]

    result_lines = [lines[i] for i in selected]
    return "\n".join(result_lines)


def filter_log_file(
    filepath: str,
    max_lines: int = DEFAULT_MAX_LINES,
    tail_bytes: Optional[int] = 65536,
) -> str:
    """
    Lê um arquivo de log e filtra as linhas relevantes.
    Por padrão lê apenas os últimos 64KB para performance.

    Args:
        filepath: Caminho do arquivo
        max_lines: Máximo de linhas no resultado
        tail_bytes: Bytes a ler do final do arquivo (None = arquivo inteiro)

    Returns:
        Log filtrado
    """
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            if tail_bytes:
                f.seek(0, 2)
                pos = f.tell()
                f.seek(max(0, pos - tail_bytes))
            content = f.read()
        return filter_logs(content, max_lines=max_lines)
    except (OSError, IOError) as e:
        return f"[Erro ao ler log: {e}]"
