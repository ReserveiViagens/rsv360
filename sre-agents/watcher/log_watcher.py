"""Observa arquivo de log e dispara o fluxo de agentes ao detectar erros."""

import os
import sys
import time
import re

# Adiciona o diretório pai ao path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    HAS_WATCHDOG = True
except ImportError:
    HAS_WATCHDOG = False

from sre_agents.log_filter import filter_logs, _matches_error

# Padrões de erro para disparar o fluxo
TRIGGER_PATTERNS = [
    r"\bError\b",
    r"\bERROR\b",
    r"\bException\b",
    r"\bCRITICAL\b",
    r"\bFATAL\b",
    r"\bfailed\b",
    r"\bcrash\b",
    r"\bunhandledRejection\b",
    r"\buncaughtException\b",
    r"\bprocess\.exit\b",
]
_TRIGGER_REGEX = re.compile("|".join(f"({p})" for p in TRIGGER_PATTERNS), re.IGNORECASE)


def should_trigger(line: str) -> bool:
    """Verifica se a linha deve disparar o fluxo de agentes."""
    return bool(_TRIGGER_REGEX.search(line))


def tail_file(filepath: str, max_lines: int = 100) -> str:
    """Lê as últimas linhas do arquivo."""
    try:
        with open(filepath, "r", encoding="utf-8", errors="replace") as f:
            f.seek(0, 2)
            size = f.tell()
            chunk_size = min(65536, size)
            f.seek(max(0, size - chunk_size))
            content = f.read()
        lines = content.strip().split("\n")
        return "\n".join(lines[-max_lines:])
    except (OSError, IOError) as e:
        return f"[Erro ao ler: {e}]"


def trigger_agents(log_text: str, thread_id: str = None):
    """Dispara o fluxo de agentes com o log."""
    from main import run_with_log
    tid = thread_id or f"watcher-{int(time.time())}"
    run_with_log(log_text, thread_id=tid)


class LogFileHandler(FileSystemEventHandler):
    """Handler para eventos de alteração no arquivo de log."""

    def __init__(self, filepath: str, callback=None):
        self.filepath = filepath
        self.callback = callback or trigger_agents
        try:
            with open(filepath, "r", encoding="utf-8", errors="replace") as f:
                f.seek(0, 2)
                self._last_size = f.tell()
        except (OSError, IOError):
            self._last_size = 0

    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path != self.filepath:
            return
        try:
            with open(self.filepath, "r", encoding="utf-8", errors="replace") as f:
                f.seek(self._last_size)
                new_content = f.read()
                self._last_size = f.tell()
        except (OSError, IOError):
            return

        for line in new_content.split("\n"):
            if should_trigger(line):
                log_snippet = tail_file(self.filepath)
                filtered = filter_logs(log_snippet)
                if filtered:
                    print(f"[Watcher] Erro detectado. Disparando agentes...")
                    self.callback(filtered)
                break


def watch_log_file(filepath: str):
    """Observa o arquivo de log e dispara agentes ao detectar erros."""
    if not HAS_WATCHDOG:
        print("Instale watchdog: pip install watchdog")
        return

    if not os.path.exists(filepath):
        print(f"Arquivo não encontrado: {filepath}")
        print("Crie o arquivo ou ajuste BACKEND_LOG_FILE no .env")
        return

    handler = LogFileHandler(filepath)
    observer = Observer()
    observer.schedule(handler, os.path.dirname(filepath), recursive=False)
    observer.start()
    print(f"Observando {filepath}. Pressione Ctrl+C para parar.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("file", nargs="?", default=None, help="Arquivo de log")
    args = parser.parse_args()
    path = args.file or os.getenv("BACKEND_LOG_FILE", "../backend/logs/combined.log")
    path = os.path.abspath(os.path.join(os.path.dirname(__file__), path))
    watch_log_file(path)
