"""API para receber erros, disparar o fluxo de agentes e dashboard de monitoramento."""

import os
import sys
import threading
import time
import uuid
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from collections import deque
from urllib import request as urlrequest
from urllib import error as urlerror
from urllib.parse import urlparse

# Adiciona sre-agents/ e sre-agents/src ao path
_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, _base)
sys.path.insert(0, os.path.join(_base, "src"))

from dotenv import load_dotenv
load_dotenv()

try:
    from flask import Flask, request, jsonify
    HAS_FLASK = True
except ImportError:
    HAS_FLASK = False

app = Flask(__name__, static_folder=None) if HAS_FLASK else None

# Armazenamento em memória
_active_threads = {}
_history = deque(maxlen=200)  # Últimos 200 eventos
_history_lock = threading.Lock()

# Coletor automático
_collector_running = False
_collector_errors = deque(maxlen=100)
_collector_lock = threading.Lock()
_collector_thread = None
_collector_file_positions = {}

# Estado da central de manutenção
_maintenance_lock = threading.Lock()
_maintenance_events = deque(maxlen=100)
_maintenance_running = False

SERVICE_TARGETS = [
    {"name": "Site Publico", "url": "http://localhost:3000", "critical": True},
    {"name": "Backend Principal", "url": "http://localhost:5000", "critical": True},
    {"name": "Backend Admin/CMS", "url": "http://localhost:5002", "critical": True},
    {"name": "Agentes SRE", "url": "http://localhost:5050", "critical": False},
]
MICROSERVICE_TARGETS = [
    {"name": "core-api", "port": 6000},
    {"name": "user-management", "port": 6001},
    {"name": "hotel-management", "port": 6002},
    {"name": "travel-api", "port": 6003},
    {"name": "booking-engine", "port": 6004},
    {"name": "finance-api", "port": 6005},
    {"name": "tickets-api", "port": 6006},
    {"name": "payments-gateway", "port": 6007},
    {"name": "ecommerce-api", "port": 6008},
    {"name": "attractions-api", "port": 6009},
    {"name": "vouchers-api", "port": 6010},
    {"name": "voucher-editor", "port": 6011},
    {"name": "giftcards-api", "port": 6012},
    {"name": "coupons-api", "port": 6013},
    {"name": "parks-api", "port": 6014},
    {"name": "maps-api", "port": 6015},
    {"name": "visa-processing", "port": 6016},
    {"name": "marketing-api", "port": 6017},
    {"name": "subscriptions", "port": 6018},
    {"name": "seo-api", "port": 6019},
    {"name": "multilingual", "port": 6020},
    {"name": "videos-api", "port": 6021},
    {"name": "photos-api", "port": 6022},
    {"name": "admin-panel", "port": 6023},
    {"name": "analytics-api", "port": 6024},
    {"name": "reports-api", "port": 6025},
    {"name": "data-management", "port": 6026},
    {"name": "notifications", "port": 6027},
    {"name": "reviews-api", "port": 6028},
    {"name": "rewards-api", "port": 6029},
    {"name": "loyalty-api", "port": 6030},
    {"name": "sales-api", "port": 6031},
]

# URLs que podem retornar 404 na raiz e ainda assim são consideradas online.
# Permite ajuste via ambiente: SRE_ALLOW_ROOT_404_URLS=http://localhost:5000,http://localhost:7000
DEFAULT_ROOT_404_URLS = {"http://localhost:5000"}


def _normalize_url(url: str) -> str:
    return str(url or "").strip().rstrip("/")


def _load_root_404_allowed_urls():
    allowed = {_normalize_url(url) for url in DEFAULT_ROOT_404_URLS if _normalize_url(url)}
    raw = os.getenv("SRE_ALLOW_ROOT_404_URLS", "")
    if raw:
        for url in raw.split(","):
            normalized = _normalize_url(url)
            if normalized:
                allowed.add(normalized)
    return allowed


ROOT_404_ALLOWED_URLS = _load_root_404_allowed_urls()


def _service_status_meta(probe: dict, url: str, allow_root_404: bool = False):
    status_code = probe.get("status_code")
    location = str(probe.get("location", "") or "")
    location_lower = location.lower()
    permitted_root_404 = allow_root_404 or (_normalize_url(url) in ROOT_404_ALLOWED_URLS)
    online_without_root = bool(permitted_root_404 and probe.get("ok") and status_code == 404)
    is_not_found = bool(probe.get("ok") and status_code == 404 and not online_without_root)
    is_redirect = status_code in (301, 302, 303, 307, 308)
    is_auth_redirect = bool(
        probe.get("ok") and is_redirect and (
            "/login" in location_lower
            or "/admin/login" in location_lower
            or "redirect=" in location_lower
            or "from=" in location_lower
        )
    )
    error_text = str(probe.get("error", "")).lower()
    is_timeout = bool((not probe.get("ok")) and ("timed out" in error_text or "timeout" in error_text))
    if online_without_root:
        status_label = "online_sem_rota_raiz"
    elif is_auth_redirect:
        status_label = "redirecionamento_auth"
    elif is_timeout:
        status_label = "timeout"
    elif is_not_found:
        status_label = "not_found"
    else:
        status_label = "online" if probe.get("ok") else "offline"
    return {
        "status_label": status_label,
        "online_without_root": online_without_root,
        "is_timeout": is_timeout,
        "is_not_found": is_not_found,
        "is_auth_redirect": is_auth_redirect,
    }


def _run_agents(log_text: str, thread_id: str):
    """Executa o fluxo em background e armazena resultado."""
    from main import run_with_log
    try:
        result, config = run_with_log(log_text, thread_id=thread_id)
        is_interrupted = "__interrupt__" in result
        _active_threads[thread_id]["status"] = "aguardando_aprovacao" if is_interrupted else "concluido"
        _active_threads[thread_id]["result"] = {
            "raw_log": result.get("raw_log", "")[:1000],
            "error_log": result.get("error_log", ""),
            "diagnosis": result.get("diagnosis", ""),
            "proposed_solution": result.get("proposed_solution", ""),
            "status": result.get("status", ""),
            "execution_output": result.get("execution_output", ""),
            "interrupted": is_interrupted,
        }
        _active_threads[thread_id]["updated_at"] = datetime.now().isoformat()
        with _history_lock:
            _history.append({
                "thread_id": thread_id,
                "timestamp": datetime.now().isoformat(),
                "status": "aguardando_aprovacao" if is_interrupted else "concluido",
                "raw_log_preview": log_text[:200] + "..." if len(log_text) > 200 else log_text,
                "diagnosis": result.get("diagnosis", "")[:300],
                "proposed_solution": result.get("proposed_solution", "")[:300],
            })
    except Exception as e:
        _active_threads[thread_id]["status"] = "erro"
        _active_threads[thread_id]["error"] = str(e)
        _active_threads[thread_id]["updated_at"] = datetime.now().isoformat()
        with _history_lock:
            _history.append({
                "thread_id": thread_id,
                "timestamp": datetime.now().isoformat(),
                "status": "erro",
                "error": str(e),
                "raw_log_preview": log_text[:200] + "..." if len(log_text) > 200 else log_text,
            })


def _get_log_file_paths():
    """Retorna caminhos de arquivos de log do RSV360 (descoberta dinamica)."""
    base = os.path.dirname(os.path.dirname(_base))
    paths = set()

    # Lista base (arquivos conhecidos)
    base_files = [
        os.path.join(base, "backend", "server_out.txt"),
        os.path.join(base, "backend", "server_err.txt"),
        os.path.join(base, "logs", "npm-install.log"),
    ]
    for p in base_files:
        if os.path.isfile(p):
            paths.add(p)

    # Diretorios para escanear (*.log e *.txt, ate 2 niveis)
    scan_dirs = [
        os.path.join(base, "backend", "logs"),
        os.path.join(base, "apps", "turismo", "logs"),
        os.path.join(base, "apps", "site-publico", "logs"),
        os.path.join(base, "logs"),
    ]
    # COLLECTOR_LOG_PATHS opcional (ex: backend/logs,apps/turismo/logs)
    env_paths = os.getenv("COLLECTOR_LOG_PATHS", "")
    if env_paths:
        for rel in env_paths.split(","):
            rel = rel.strip()
            if rel:
                scan_dirs.append(os.path.join(base, rel.replace("/", os.sep)))

    for scan_dir in scan_dirs:
        if not os.path.isdir(scan_dir):
            continue
        for root, _dirs, files in os.walk(scan_dir):
            depth = root[len(scan_dir):].count(os.sep)
            if depth > 1:
                break
            for f in files:
                if f.endswith(".log") or f.endswith(".txt"):
                    p = os.path.join(root, f)
                    if os.path.isfile(p):
                        paths.add(p)

    return sorted(paths)


def _collector_loop():
    """Loop do coletor: monitora arquivos de log e detecta erros."""
    global _collector_running, _collector_file_positions
    try:
        from sre_agents.log_filter import _matches_error
    except ImportError:
        import re
        _err_re = re.compile(
            r"\b(Error|ERROR|Exception|CRITICAL|FATAL|failed|crash|unhandledRejection|uncaughtException|EADDRINUSE|ECONNREFUSED)\b",
            re.IGNORECASE
        )
        def _matches_error(line):
            return bool(_err_re.search(line))

    paths = _get_log_file_paths()
    while _collector_running:
        for path in paths:
            if not os.path.isfile(path):
                continue
            try:
                with open(path, "r", encoding="utf-8", errors="replace") as f:
                    f.seek(0, 2)
                    size = f.tell()
                pos = _collector_file_positions.get(path, 0)
                if size < pos:
                    pos = 0
                if pos >= size:
                    continue
                with open(path, "r", encoding="utf-8", errors="replace") as f:
                    f.seek(pos)
                    content = f.read()
                _collector_file_positions[path] = size
                for line in content.split("\n"):
                    if line.strip() and _matches_error(line):
                        with _collector_lock:
                            _collector_errors.append({
                                "timestamp": datetime.now().isoformat(),
                                "file": os.path.basename(path),
                                "path": path,
                                "line": line.strip()[:500],
                            })
            except (OSError, IOError):
                pass
        time.sleep(3)


def _check_service(url: str, timeout: int = 3):
    """Verifica URL sem seguir redirects automaticamente."""
    class _NoRedirect(urlrequest.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    start = time.time()
    req = urlrequest.Request(url, headers={"User-Agent": "RSV360-SRE/1.0"})
    opener = urlrequest.build_opener(_NoRedirect)
    try:
        with opener.open(req, timeout=timeout) as resp:
            elapsed_ms = int((time.time() - start) * 1000)
            return {
                "url": url,
                "ok": True,
                "status_code": int(resp.getcode()),
                "latency_ms": elapsed_ms,
                "location": resp.headers.get("Location", ""),
            }
    except urlerror.HTTPError as err:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "url": url,
            "ok": True,
            "status_code": int(err.code),
            "latency_ms": elapsed_ms,
            "location": (err.headers.get("Location", "") if getattr(err, "headers", None) else ""),
        }
    except Exception as err:
        elapsed_ms = int((time.time() - start) * 1000)
        return {
            "url": url,
            "ok": False,
            "status_code": None,
            "latency_ms": elapsed_ms,
            "location": "",
            "error": str(err),
        }


def _collect_system_health():
    services = []
    for target in SERVICE_TARGETS:
        result = _check_service(target["url"])
        status_meta = _service_status_meta(
            result,
            target["url"],
            allow_root_404=bool(target.get("allow_root_404", False)),
        )
        services.append({
            "name": target["name"],
            "critical": target["critical"],
            **status_meta,
            **result,
        })
    healthy = all(s["ok"] for s in services if s["critical"])
    return {"timestamp": datetime.now().isoformat(), "healthy": healthy, "services": services}


def _load_mapped_routes():
    """Carrega rotas do mapeamento de rotas (ignora dinamicas)."""
    routes = []
    root = _repo_root_path()
    mapping_path = os.path.join(root, "apps", "site-publico", "docs", "MAPEAMENTO_ROTAS_RSV360.md")
    if not os.path.isfile(mapping_path):
        return routes

    try:
        with open(mapping_path, "r", encoding="utf-8", errors="replace") as f:
            for line in f:
                line = line.strip()
                if not line.startswith("| `/"):
                    continue
                parts = [p.strip() for p in line.split("|")]
                if len(parts) < 2:
                    continue
                route = parts[1].strip("`")
                if not route.startswith("/"):
                    continue
                if "[" in route or "]" in route:
                    continue
                routes.append(route)
    except Exception:
        return []

    unique_routes = []
    seen = set()
    for r in routes:
        if r not in seen:
            seen.add(r)
            unique_routes.append(r)
    return unique_routes


def _collect_full_scan():
    """Varredura de servidores, microservicos, paginas e checks funcionais."""
    servers = _collect_system_health()

    microservices = []
    with ThreadPoolExecutor(max_workers=24) as pool:
        futures = {
            pool.submit(_check_service, f"http://localhost:{ms['port']}/health", 2): ms
            for ms in MICROSERVICE_TARGETS
        }
        for future, ms in [(f, futures[f]) for f in futures]:
            probe = future.result()
            status_meta = _service_status_meta(probe, probe.get("url", f"http://localhost:{ms['port']}/health"))
            microservices.append({
                "name": ms["name"],
                "port": ms["port"],
                **status_meta,
                **probe,
            })

    mapped_routes = _load_mapped_routes()
    pages_timeout = int(os.getenv("SRE_PAGES_TIMEOUT_SECONDS", "7"))
    if pages_timeout < 2:
        pages_timeout = 2
    if pages_timeout > 20:
        pages_timeout = 20
    # Warm-up reduz falso timeout durante compilacao inicial do Next.js.
    warmup_attempts = int(os.getenv("SRE_SITE_WARMUP_ATTEMPTS", "2"))
    if warmup_attempts < 1:
        warmup_attempts = 1
    if warmup_attempts > 4:
        warmup_attempts = 4
    warmup_timeout = int(os.getenv("SRE_SITE_WARMUP_TIMEOUT_SECONDS", str(min(pages_timeout + 2, 20))))
    if warmup_timeout < 3:
        warmup_timeout = 3
    if warmup_timeout > 25:
        warmup_timeout = 25
    for idx in range(warmup_attempts):
        warmup_probe = _check_service("http://localhost:3000", warmup_timeout)
        if warmup_probe.get("ok"):
            break
        if idx < warmup_attempts - 1:
            time.sleep(0.8 * (idx + 1))

    pages = []
    with ThreadPoolExecutor(max_workers=24) as pool:
        futures = {
            pool.submit(_check_service, f"http://localhost:3000{route}", pages_timeout): route
            for route in mapped_routes
        }
        for future, route in [(f, futures[f]) for f in futures]:
            probe = future.result()
            status_meta = _service_status_meta(probe, probe.get("url", f"http://localhost:3000{route}"))
            pages.append({
                "route": route,
                **status_meta,
                **probe,
            })

    functional_checks = [
        {"name": "Swagger API docs", "url": "http://localhost:3000/api/docs"},
        {"name": "Admin login page", "url": "http://localhost:3000/admin/login"},
        {"name": "Main API root", "url": "http://localhost:5000"},
        {"name": "Admin API root", "url": "http://localhost:5002"},
    ]
    functional_timeout = int(os.getenv("SRE_FUNCTION_CHECK_TIMEOUT_SECONDS", str(max(6, pages_timeout))))
    if functional_timeout < 2:
        functional_timeout = 2
    if functional_timeout > 20:
        functional_timeout = 20
    functions = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {
            pool.submit(_check_service, chk["url"], functional_timeout): chk
            for chk in functional_checks
        }
        for future, chk in [(f, futures[f]) for f in futures]:
            probe = future.result()
            status_meta = _service_status_meta(
                probe,
                chk["url"],
                allow_root_404=bool(chk.get("allow_root_404", False)),
            )
            functions.append({
                "name": chk["name"],
                **status_meta,
                **probe,
            })

    totals = {
        "servers_total": len(servers["services"]),
        "servers_down": sum(1 for s in servers["services"] if not s["ok"]),
        "microservices_total": len(microservices),
        "microservices_down": sum(1 for s in microservices if not s["ok"]),
        "pages_total": len(pages),
        "pages_down": sum(1 for s in pages if not s["ok"]),
        "functions_total": len(functions),
        "functions_down": sum(1 for s in functions if not s["ok"]),
    }

    inconsistencies = []
    for s in servers["services"]:
        if not s["ok"]:
            inconsistencies.append(f"Servidor indisponivel: {s['name']} ({s['url']})")
    for s in microservices:
        if not s["ok"]:
            inconsistencies.append(f"Microservico indisponivel: {s['name']} ({s['url']})")
    for p in pages:
        if not p["ok"]:
            if p.get("is_timeout"):
                inconsistencies.append(f"Rota com timeout: {p['route']} (timeout={pages_timeout}s)")
            else:
                inconsistencies.append(f"Rota nao respondeu: {p['route']}")

    return {
        "timestamp": datetime.now().isoformat(),
        "scan_config": {
            "pages_timeout_seconds": pages_timeout,
            "site_warmup_attempts": warmup_attempts,
            "site_warmup_timeout_seconds": warmup_timeout,
            "functional_timeout_seconds": functional_timeout,
        },
        "servers": servers["services"],
        "microservices": microservices,
        "pages": pages,
        "functional_checks": functions,
        "totals": totals,
        "inconsistencies": inconsistencies[:300],
    }


def _build_diagnostic_report(scan_data: dict):
    """Gera explicações e sugestões acionáveis para humanos e agentes."""
    totals = scan_data.get("totals", {})
    pages = scan_data.get("pages", [])
    servers = scan_data.get("servers", [])
    microservices = scan_data.get("microservices", [])
    functions = scan_data.get("functional_checks", [])
    pages_timeout_seconds = ((scan_data.get("scan_config") or {}).get("pages_timeout_seconds")) or 5

    offline_pages = [p for p in pages if not p.get("ok")]
    timeout_pages = [p for p in offline_pages if p.get("is_timeout")]
    auth_redirect_pages = [p for p in pages if p.get("is_auth_redirect")]
    not_found_pages = [p for p in pages if p.get("is_not_found")]
    down_servers = [s for s in servers if not s.get("ok")]
    down_micro = [m for m in microservices if not m.get("ok")]
    down_functions = [f for f in functions if not f.get("ok")]

    total_pages = max(len(pages), 1)
    category_counts = {
        "timeout": len(timeout_pages),
        "auth_redirect": len(auth_redirect_pages),
        "not_found": len(not_found_pages),
        "offline": len([p for p in pages if not p.get("ok") and not p.get("is_timeout")]),
        "online": len([p for p in pages if p.get("ok") and not p.get("is_auth_redirect") and not p.get("is_not_found")]),
    }
    category_percentages = {
        k: round((v * 100.0) / total_pages, 2) for k, v in category_counts.items()
    }

    likely_causes = []
    if timeout_pages:
        likely_causes.append(
            f"Muitas rotas estão falhando por timeout ({len(timeout_pages)} de {len(offline_pages)} rotas fora). "
            f"Isso normalmente ocorre quando o Next.js está compilando sob demanda ou quando a rota está lenta."
        )
    if auth_redirect_pages:
        likely_causes.append(
            f"Foram detectados redirecionamentos por autenticação em {len(auth_redirect_pages)} rotas (comportamento esperado em rotas protegidas sem sessão)."
        )
    if not_found_pages:
        likely_causes.append(
            f"Foram detectadas {len(not_found_pages)} rotas com 404 real (roteamento inexistente ou não implementado)."
        )
    if down_servers:
        likely_causes.append(
            f"Há serviços principais indisponíveis ({len(down_servers)}), o que impacta páginas e checks dependentes."
        )
    if not likely_causes and offline_pages:
        likely_causes.append(
            "As rotas fora parecem ser erros de aplicação/roteamento (não timeout). Verifique logs do Next.js e middleware."
        )
    if not likely_causes:
        likely_causes.append("Nenhuma anomalia crítica detectada no momento.")

    top_routes = []
    for p in (offline_pages + not_found_pages + auth_redirect_pages)[:30]:
        top_routes.append({
            "route": p.get("route"),
            "url": p.get("url"),
            "status_label": p.get("status_label"),
            "latency_ms": p.get("latency_ms"),
            "status_code": p.get("status_code"),
            "location": p.get("location", ""),
            "error": p.get("error", ""),
        })

    recommendations = [
        f"Aumentar/ajustar timeout de páginas no monitor via SRE_PAGES_TIMEOUT_SECONDS (atual: {pages_timeout_seconds}s).",
        "Executar um warm-up inicial nas rotas críticas após reinício para reduzir falso-positivo de timeout.",
        "Checar rotas protegidas (/admin/*, /dashboard*) para confirmar redirecionamento rápido quando não autenticado.",
        "Analisar inconsistências com IA e priorizar severidade high/critical para correções assistidas.",
    ]

    learning_notes = [
        "Offline com HTTP '--' geralmente indica falha de conexão ou timeout, não necessariamente 404.",
        "404 em API root pode ser esperado (serviço online sem rota raiz), diferente de indisponibilidade real.",
        "Timeout em lote de rotas após restart costuma melhorar após compilação/cache do Next.js.",
    ]

    def _server_from_url(url: str):
        try:
            parsed = urlparse(str(url or ""))
            return parsed.netloc or "desconhecido"
        except Exception:
            return "desconhecido"

    def _issue_category(item: dict):
        if item.get("is_timeout"):
            return "timeout"
        if item.get("is_auth_redirect"):
            return "auth_redirect"
        if item.get("is_not_found"):
            return "not_found"
        if not item.get("ok"):
            return "offline"
        return "ok"

    grouped = {}
    all_items = (
        [dict(x, item_type="servidor", display=x.get("name")) for x in servers]
        + [dict(x, item_type="microservico", display=x.get("name")) for x in microservices]
        + [dict(x, item_type="pagina", display=x.get("route")) for x in pages]
        + [dict(x, item_type="funcionalidade", display=x.get("name")) for x in functions]
    )
    for item in all_items:
        server_key = _server_from_url(item.get("url"))
        entry = grouped.setdefault(server_key, {
            "server": server_key,
            "total": 0,
            "ok": 0,
            "issues": {"timeout": 0, "auth_redirect": 0, "not_found": 0, "offline": 0},
            "items": [],
        })
        entry["total"] += 1
        category = _issue_category(item)
        if category == "ok":
            entry["ok"] += 1
        else:
            entry["issues"][category] = entry["issues"].get(category, 0) + 1
        if category != "ok":
            entry["items"].append({
                "type": item.get("item_type"),
                "name": item.get("display"),
                "url": item.get("url"),
                "category": category,
                "status_label": item.get("status_label"),
                "status_code": item.get("status_code"),
                "latency_ms": item.get("latency_ms"),
                "location": item.get("location", ""),
                "error": item.get("error", ""),
            })

    per_server = sorted(
        grouped.values(),
        key=lambda x: (
            -(x["issues"]["offline"] + x["issues"]["timeout"] + x["issues"]["not_found"] + x["issues"]["auth_redirect"]),
            x["server"],
        ),
    )
    for s in per_server:
        if len(s["items"]) > 25:
            s["items"] = s["items"][:25]

    return {
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "servers_down": totals.get("servers_down", 0),
            "microservices_down": totals.get("microservices_down", 0),
            "pages_down": totals.get("pages_down", 0),
            "pages_timeout": len(timeout_pages),
            "pages_auth_redirect": len(auth_redirect_pages),
            "pages_not_found": len(not_found_pages),
            "functions_down": totals.get("functions_down", 0),
        },
        "page_categories": {
            "total_pages": len(pages),
            "counts": category_counts,
            "percentages": category_percentages,
        },
        "likely_causes": likely_causes,
        "top_impacted_routes": top_routes,
        "per_server": per_server,
        "recommendations": recommendations,
        "learning_notes": learning_notes,
        "agent_actions": {
            "suggested_api": "/api/system/analyze-inconsistencies",
            "suggested_payload": {"max_items": 25, "include_low": False},
            "next_step": "Executar analise automatica e revisar itens aguardando_aprovacao na fila.",
        },
    }


def _build_inconsistency_records(scan_data: dict):
    """Normaliza inconsistências para entrada do pipeline de agentes."""
    records = []

    for s in scan_data.get("servers", []):
        if s.get("ok"):
            continue
        severity = "critical" if s.get("critical") else "high"
        log = (
            f"[AUTO-SCAN] {severity.upper()} servidor indisponivel\n"
            f"service={s.get('name')}\n"
            f"url={s.get('url')}\n"
            f"status={s.get('status_code')}\n"
            f"latency_ms={s.get('latency_ms')}\n"
            f"error={s.get('error', '')}"
        )
        records.append({"severity": severity, "title": f"Servidor fora: {s.get('name')}", "log": log})

    for m in scan_data.get("microservices", []):
        if m.get("ok"):
            continue
        log = (
            "[AUTO-SCAN] HIGH microservico indisponivel\n"
            f"service={m.get('name')}\n"
            f"port={m.get('port')}\n"
            f"url={m.get('url')}\n"
            f"status={m.get('status_code')}\n"
            f"latency_ms={m.get('latency_ms')}\n"
            f"error={m.get('error', '')}"
        )
        records.append({"severity": "high", "title": f"Microservico fora: {m.get('name')}", "log": log})

    for f in scan_data.get("functional_checks", []):
        if f.get("ok"):
            continue
        log = (
            "[AUTO-SCAN] MEDIUM funcionalidade indisponivel\n"
            f"check={f.get('name')}\n"
            f"url={f.get('url')}\n"
            f"status={f.get('status_code')}\n"
            f"latency_ms={f.get('latency_ms')}\n"
            f"error={f.get('error', '')}"
        )
        records.append({"severity": "medium", "title": f"Funcionalidade fora: {f.get('name')}", "log": log})

    for p in scan_data.get("pages", []):
        if p.get("ok"):
            continue
        log = (
            "[AUTO-SCAN] LOW rota indisponivel\n"
            f"route={p.get('route')}\n"
            f"url={p.get('url')}\n"
            f"status={p.get('status_code')}\n"
            f"latency_ms={p.get('latency_ms')}\n"
            f"error={p.get('error', '')}"
        )
        records.append({"severity": "low", "title": f"Rota fora: {p.get('route')}", "log": log})

    priority = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    records.sort(key=lambda x: priority.get(x["severity"], 9))
    return records


def _list_auto_scan_threads(limit: int = 100):
    """Lista threads disparadas automaticamente pela varredura."""
    items = []
    for tid, data in _active_threads.items():
        if data.get("source") != "auto-scan":
            continue
        items.append({
            "thread_id": tid,
            "status": data.get("status", "unknown"),
            "severity": data.get("severity", "unknown"),
            "title": data.get("title", ""),
            "created_at": data.get("created_at", ""),
            "updated_at": data.get("updated_at", ""),
            "error": data.get("error"),
        })

    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items[:limit]


def _repo_root_path():
    return os.path.dirname(_base)


def _start_full_restart():
    """Dispara restart completo em background sem bloquear API."""
    root = _repo_root_path()
    script = os.path.join(root, "Reiniciar Sistema Completo.ps1")
    if not os.path.isfile(script):
        script = os.path.join(root, "Iniciar Sistema Completo.ps1")
    if not os.path.isfile(script):
        raise FileNotFoundError("Script de reinicio/inicializacao nao encontrado")

    subprocess.Popen(
        ["powershell", "-ExecutionPolicy", "Bypass", "-File", script],
        cwd=root,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    return script


if HAS_FLASK:

    @app.route("/")
    def index():
        """Serve o dashboard HTML."""
        return DASHBOARD_HTML

    @app.route("/logs")
    @app.route("/collector")
    @app.route("/history")
    @app.route("/monitor-total")
    @app.route("/monitor")
    def spa_fallback():
        """Fallback para rotas SPA - retorna o mesmo dashboard (abas são client-side)."""
        return DASHBOARD_HTML

    @app.route("/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "sre-agents-trigger"})

    @app.route("/api/status", methods=["GET"])
    def api_status():
        """Status completo: threads ativos e resumo."""
        threads_list = [
            {
                "thread_id": tid,
                "status": data.get("status", "unknown"),
                "created_at": data.get("created_at", ""),
                "updated_at": data.get("updated_at", ""),
                "result": data.get("result", {}),
                "error": data.get("error"),
            }
            for tid, data in _active_threads.items()
        ]
        return jsonify({
            "service": "sre-agents",
            "threads": threads_list,
            "pending_count": sum(1 for t in _active_threads.values() if t.get("status") == "aguardando_aprovacao"),
            "history_count": len(_history),
        })

    @app.route("/api/history", methods=["GET"])
    def api_history():
        """Histórico de análises."""
        limit = int(request.args.get("limit", 50))
        with _history_lock:
            items = list(_history)[-limit:]
        return jsonify({"history": list(reversed(items))})

    @app.route("/api/logs", methods=["GET"])
    def api_logs():
        """Lista arquivos de log disponíveis e conteúdo."""
        paths = _get_log_file_paths()
        available = []
        for i, p in enumerate(paths):
            if os.path.isfile(p):
                try:
                    size = os.path.getsize(p)
                    available.append({"index": i, "path": p, "size": size, "name": os.path.basename(p)})
                except OSError:
                    pass
        idx = request.args.get("index")
        if idx is None or idx == "":
            return jsonify({"files": available})
        try:
            idx = int(idx)
            if 0 <= idx < len(paths):
                path = paths[idx]
                if os.path.isfile(path):
                    with open(path, "r", encoding="utf-8", errors="replace") as f:
                        lines = f.readlines()
                    tail = int(request.args.get("lines", 200))
                    content = "".join(lines[-tail:])
                    return jsonify({"path": path, "content": content, "total_lines": len(lines)})
        except (ValueError, IndexError):
            pass
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        return jsonify({"error": "Arquivo não encontrado"}), 404

    @app.route("/trigger", methods=["POST"])
    def trigger():
        """Recebe log de erro via POST e dispara o fluxo."""
        log_text = None
        if request.is_json:
            log_text = request.json.get("log", "")
        else:
            log_text = request.form.get("log", request.data.decode("utf-8", errors="replace"))

        if not log_text or not log_text.strip():
            return jsonify({"error": "Campo 'log' obrigatório"}), 400

        thread_id = f"api-{uuid.uuid4().hex[:8]}"
        _active_threads[thread_id] = {
            "status": "executando",
            "created_at": datetime.now().isoformat(),
            "raw_log": log_text[:500],
        }

        thread = threading.Thread(target=_run_agents, args=(log_text.strip(), thread_id))
        thread.start()

        return jsonify({
            "status": "triggered",
            "thread_id": thread_id,
            "message": "Fluxo iniciado. Aguarde a análise ou aprovação.",
        })

    @app.route("/approve/<thread_id>", methods=["POST", "GET"])
    def approve(thread_id):
        """Aprova a correção e retoma o fluxo."""
        from main import resume
        result = resume(thread_id, approved=True)
        return jsonify({
            "status": result.get("status", "ok"),
            "execution_output": result.get("execution_output", ""),
        })

    @app.route("/reject/<thread_id>", methods=["POST", "GET"])
    def reject(thread_id):
        """Rejeita a correção."""
        from main import resume
        result = resume(thread_id, approved=False)
        return jsonify({"status": result.get("status", "abortado")})

    @app.route("/api/collector/start", methods=["POST", "GET"])
    def collector_start():
        """Inicia o coletor automático."""
        global _collector_running, _collector_thread, _collector_file_positions
        if _collector_running:
            return jsonify({"status": "already_running", "message": "Coletor já está em execução"})
        _collector_running = True
        _collector_file_positions = {}
        for path in _get_log_file_paths():
            if os.path.isfile(path):
                try:
                    with open(path, "r", encoding="utf-8", errors="replace") as f:
                        f.seek(0, 2)
                        _collector_file_positions[path] = f.tell()
                except (OSError, IOError):
                    pass
        _collector_thread = threading.Thread(target=_collector_loop, daemon=True)
        _collector_thread.start()
        return jsonify({"status": "started", "message": "Coletor iniciado"})

    @app.route("/api/collector/stop", methods=["POST", "GET"])
    def collector_stop():
        """Para o coletor automático."""
        global _collector_running
        _collector_running = False
        return jsonify({"status": "stopped", "message": "Coletor parado"})

    @app.route("/api/collector/status", methods=["GET"])
    def collector_status():
        """Status do coletor e erros detectados."""
        with _collector_lock:
            errors = list(_collector_errors)
        return jsonify({
            "running": _collector_running,
            "errors_count": len(errors),
            "errors": list(reversed(errors)),
        })

    @app.route("/api/system/health", methods=["GET"])
    def system_health():
        """Saúde rápida das URLs principais do RSV360."""
        return jsonify(_collect_system_health())

    @app.route("/api/system/full-scan", methods=["GET"])
    def system_full_scan():
        """Varredura total: servidores, microservicos, paginas e checks funcionais."""
        return jsonify(_collect_full_scan())

    @app.route("/api/system/diagnostic-report", methods=["GET"])
    def system_diagnostic_report():
        """Resumo explicativo com causas prováveis e ações recomendadas."""
        scan = _collect_full_scan()
        report = _build_diagnostic_report(scan)
        return jsonify(report)

    @app.route("/api/system/analyze-inconsistencies", methods=["POST"])
    def analyze_inconsistencies():
        """Dispara automaticamente as inconsistencias para o pipeline de agentes."""
        payload = request.json if request.is_json else {}
        include_low = bool((payload or {}).get("include_low", False))
        max_items = int((payload or {}).get("max_items", 20))
        if max_items < 1:
            max_items = 1
        if max_items > 100:
            max_items = 100

        scan = _collect_full_scan()
        records = _build_inconsistency_records(scan)

        if not include_low:
            records = [r for r in records if r.get("severity") != "low"]

        selected = records[:max_items]
        triggered = []

        for rec in selected:
            thread_id = f"auto-{uuid.uuid4().hex[:8]}"
            _active_threads[thread_id] = {
                "status": "executando",
                "created_at": datetime.now().isoformat(),
                "raw_log": rec["log"][:500],
                "source": "auto-scan",
                "severity": rec["severity"],
                "title": rec["title"],
            }
            thread = threading.Thread(target=_run_agents, args=(rec["log"], thread_id), daemon=True)
            thread.start()
            triggered.append({
                "thread_id": thread_id,
                "severity": rec["severity"],
                "title": rec["title"],
            })

        return jsonify({
            "status": "ok",
            "total_detected": len(records),
            "triggered_count": len(triggered),
            "triggered": triggered,
            "message": "Analise automatica iniciada para inconsistencias detectadas.",
        })

    @app.route("/api/system/auto-analysis-status", methods=["GET"])
    def auto_analysis_status():
        limit = int(request.args.get("limit", 100))
        if limit < 1:
            limit = 1
        if limit > 500:
            limit = 500

        items = _list_auto_scan_threads(limit=limit)
        return jsonify({
            "count": len(items),
            "items": items,
            "summary": {
                "executando": sum(1 for i in items if i["status"] == "executando"),
                "aguardando_aprovacao": sum(1 for i in items if i["status"] == "aguardando_aprovacao"),
                "concluido": sum(1 for i in items if i["status"] == "concluido"),
                "erro": sum(1 for i in items if i["status"] == "erro"),
            }
        })

    @app.route("/api/system/auto-analysis-bulk-action", methods=["POST"])
    def auto_analysis_bulk_action():
        """Ação em lote para aprovar/rejeitar itens automáticos por severidade."""
        payload = request.json if request.is_json else {}
        action = (payload or {}).get("action", "").strip().lower()
        severity = (payload or {}).get("severity", "all").strip().lower()
        only_pending = bool((payload or {}).get("only_pending", True))
        max_items = int((payload or {}).get("max_items", 100))

        if action not in ("approve", "reject"):
            return jsonify({"status": "error", "message": "action invalida. Use approve ou reject."}), 400
        if severity not in ("all", "critical", "high", "medium", "low"):
            return jsonify({"status": "error", "message": "severity invalida."}), 400
        if max_items < 1:
            max_items = 1
        if max_items > 500:
            max_items = 500

        candidates = []
        for tid, data in _active_threads.items():
            if data.get("source") != "auto-scan":
                continue
            if only_pending and data.get("status") != "aguardando_aprovacao":
                continue
            sev = data.get("severity", "unknown")
            if severity != "all" and sev != severity:
                continue
            candidates.append({
                "thread_id": tid,
                "severity": sev,
                "created_at": data.get("created_at", ""),
                "status": data.get("status", "unknown"),
            })

        candidates.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        selected = candidates[:max_items]

        from main import resume

        processed = []
        errors = []
        skipped = []
        approved = action == "approve"
        for item in selected:
            tid = item["thread_id"]
            if item.get("status") != "aguardando_aprovacao":
                skipped.append({
                    "thread_id": tid,
                    "reason": f"status_atual={item.get('status')}",
                })
                continue
            try:
                result = resume(tid, approved=approved)
                processed.append({
                    "thread_id": tid,
                    "severity": item["severity"],
                    "status": result.get("status", "ok"),
                    "execution_output": result.get("execution_output", ""),
                })
            except Exception as err:
                errors.append({"thread_id": tid, "error": str(err)})

        return jsonify({
            "status": "ok",
            "action": action,
            "severity": severity,
            "only_pending": only_pending,
            "matched": len(candidates),
            "processed_count": len(processed),
            "skipped_count": len(skipped),
            "error_count": len(errors),
            "processed": processed,
            "skipped": skipped,
            "errors": errors,
            "message": f"Acao em lote '{action}' concluida.",
        })

    @app.route("/api/system/maintenance/history", methods=["GET"])
    def maintenance_history():
        with _maintenance_lock:
            events = list(_maintenance_events)
        return jsonify({"events": list(reversed(events)), "running": _maintenance_running})

    @app.route("/api/system/auto-heal", methods=["POST"])
    def system_auto_heal():
        """Auto-cura leve: verifica saúde e tenta ações básicas."""
        global _maintenance_running
        if _maintenance_running:
            return jsonify({"status": "busy", "message": "Ja existe rotina de manutencao em execucao"}), 409

        payload = request.json if request.is_json else {}
        mode = (payload or {}).get("mode", "light")
        started_at = datetime.now().isoformat()
        actions = []
        health = _collect_system_health()

        with _maintenance_lock:
            _maintenance_running = True

        try:
            if mode == "light":
                if not _collector_running:
                    try:
                        collector_start()
                        actions.append("collector_started")
                    except Exception:
                        actions.append("collector_start_failed")

                critical_down = [s for s in health["services"] if s["critical"] and not s["ok"]]
                if critical_down:
                    script = _start_full_restart()
                    actions.append(f"full_restart_triggered:{script}")
            elif mode == "full_restart":
                script = _start_full_restart()
                actions.append(f"full_restart_triggered:{script}")
            else:
                return jsonify({"status": "error", "message": "Modo invalido. Use light ou full_restart."}), 400
        finally:
            with _maintenance_lock:
                _maintenance_running = False
                _maintenance_events.append({
                    "timestamp": datetime.now().isoformat(),
                    "started_at": started_at,
                    "mode": mode,
                    "actions": actions,
                    "health_before": health,
                })

        return jsonify({
            "status": "ok",
            "mode": mode,
            "actions": actions,
            "health_before": health,
            "message": "Auto-cura executada",
        })


def run_server(port: int = None):
    """Inicia o servidor Flask."""
    if not HAS_FLASK:
        print("Instale Flask: pip install flask")
        return
    port = port or int(os.getenv("TRIGGER_API_PORT", "5050"))
    app.run(host="0.0.0.0", port=port, debug=False)


# HTML do Dashboard - página com abas
DASHBOARD_HTML = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Central SRE - Deteccao, Monitoramento e Auto-Cura RSV360</title>
    <style>
        :root {
            --bg-dark: #0f172a;
            --bg-card: #1e293b;
            --bg-hover: #334155;
            --accent: #06b6d4;
            --accent-dim: #0891b2;
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --text: #f1f5f9;
            --text-dim: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg-dark); color: var(--text); min-height: 100vh; line-height: 1.6; }
        .container { max-width: 1400px; margin: 0 auto; padding: 1.5rem; }
        header {
            background: linear-gradient(135deg, var(--bg-card) 0%, #0f172a 100%);
            border-bottom: 1px solid var(--bg-hover);
            padding: 1.5rem 0;
            margin-bottom: 1rem;
        }
        header h1 { font-size: 1.75rem; font-weight: 700; display: flex; align-items: center; gap: 0.75rem; }
        header h1::before { content: "🤖"; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600; margin-left: 1rem; }
        .status-ok { background: rgba(16, 185, 129, 0.2); color: var(--success); }
        .status-warn { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
        .status-err { background: rgba(239, 68, 68, 0.2); color: var(--error); }
        .nav-tabs { display: flex; gap: 0.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--bg-hover); padding-bottom: 0; }
        .nav-tab {
            padding: 0.75rem 1.25rem;
            border-radius: 0.5rem 0.5rem 0 0;
            cursor: pointer;
            font-size: 0.95rem;
            font-weight: 500;
            background: transparent;
            color: var(--text-dim);
            border: 1px solid transparent;
            border-bottom: none;
            margin-bottom: -1px;
        }
        .nav-tab:hover { background: var(--bg-hover); color: var(--text); }
        .nav-tab.active { background: var(--bg-card); color: var(--accent); border-color: var(--bg-hover); }
        .tab-panel { display: none; }
        .tab-panel.active { display: block; }
        .grid { display: grid; gap: 1.5rem; }
        .grid-2 { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }
        .card { background: var(--bg-card); border-radius: 0.75rem; border: 1px solid var(--bg-hover); overflow: hidden; }
        .card-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--bg-hover); font-weight: 600; font-size: 1rem; display: flex; justify-content: space-between; align-items: center; }
        .card-body { padding: 1.25rem; }
        textarea { width: 100%; min-height: 120px; padding: 0.75rem; background: var(--bg-dark); border: 1px solid var(--bg-hover); border-radius: 0.5rem; color: var(--text); font-family: 'Consolas', monospace; font-size: 0.85rem; resize: vertical; }
        textarea:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.2); }
        button, .btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.25rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.9rem; cursor: pointer; border: none; transition: all 0.2s; }
        .btn-primary { background: var(--accent); color: var(--bg-dark); }
        .btn-primary:hover { background: var(--accent-dim); transform: translateY(-1px); }
        .btn-success { background: var(--success); color: white; }
        .btn-success:hover { background: #059669; }
        .btn-danger { background: var(--error); color: white; }
        .btn-danger:hover { background: #dc2626; }
        .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
        .btn-ghost { background: transparent; color: var(--text-dim); border: 1px solid var(--bg-hover); }
        .btn-ghost:hover { background: var(--bg-hover); color: var(--text); }
        .log-viewer { background: var(--bg-dark); border: 1px solid var(--bg-hover); border-radius: 0.5rem; padding: 1rem; font-family: 'Consolas', monospace; font-size: 0.8rem; max-height: 300px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }
        .log-viewer .line-error { color: var(--error); }
        .log-viewer .line-warn { color: var(--warning); }
        .log-viewer .line-info { color: var(--accent); }
        .thread-item { padding: 1rem; border: 1px solid var(--bg-hover); border-radius: 0.5rem; margin-bottom: 0.75rem; background: var(--bg-dark); }
        .thread-item.pending { border-left: 4px solid var(--warning); }
        .thread-item.completed { border-left: 4px solid var(--success); }
        .thread-item.error { border-left: 4px solid var(--error); }
        .collector-item { padding: 0.75rem 1rem; border: 1px solid var(--bg-hover); border-radius: 0.5rem; margin-bottom: 0.5rem; background: var(--bg-dark); border-left: 4px solid var(--error); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .collector-item .line { flex: 1; font-family: 'Consolas', monospace; font-size: 0.85rem; word-break: break-all; }
        .history-item { padding: 0.75rem 1rem; border-bottom: 1px solid var(--bg-hover); font-size: 0.9rem; }
        .history-item:hover { background: var(--bg-hover); }
        .meta { font-size: 0.8rem; color: var(--text-dim); margin-top: 0.5rem; }
        .hidden { display: none !important; }
        .spinner { width: 1rem; height: 1rem; border: 2px solid var(--bg-hover); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; padding: 1rem 1.5rem; border-radius: 0.5rem; font-weight: 500; box-shadow: 0 10px 40px rgba(0,0,0,0.4); z-index: 1000; animation: slideIn 0.3s ease; }
        .toast.success { background: var(--success); color: white; }
        .toast.error { background: var(--error); color: white; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        select { padding: 0.5rem 0.75rem; background: var(--bg-dark); border: 1px solid var(--bg-hover); border-radius: 0.5rem; color: var(--text); font-size: 0.9rem; }
        .empty { color: var(--text-dim); font-style: italic; padding: 1rem; text-align: center; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(2, 6, 23, 0.8); display: flex; align-items: center; justify-content: center; z-index: 2000; }
        .modal-card { width: min(560px, 92vw); background: var(--bg-card); border: 1px solid var(--bg-hover); border-radius: 0.75rem; padding: 1rem; --import-preview-legend-height: 2.35rem; }
        .modal-card.modal-wide { width: min(980px, 96vw); }
        .modal-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 0.5rem; }
        .modal-body { color: var(--text-dim); font-size: 0.9rem; white-space: pre-line; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
        .import-preview-summary { display:flex; gap:0.5rem; flex-wrap:wrap; margin: 0.5rem 0; }
        .import-preview-chip { font-size:0.8rem; padding:0.25rem 0.55rem; border-radius:999px; border:1px solid var(--bg-hover); background: var(--bg-dark); color: var(--text-dim); }
        .import-preview-legend {
            display:flex;
            gap:0.45rem;
            flex-wrap:wrap;
            align-items:center;
            position: sticky;
            top: 0;
            z-index: 2;
            background: var(--bg-card);
            padding: 0.4rem 0;
            border-bottom: 1px solid var(--bg-hover);
        }
        .import-preview-filters {
            display:flex;
            gap:0.5rem;
            flex-wrap:wrap;
            align-items:center;
            margin-top:0.5rem;
            position: sticky;
            top: calc(var(--import-preview-legend-height, 2.35rem) + 0.25rem);
            z-index: 2;
            background: var(--bg-card);
            padding: 0.35rem 0;
            border-bottom: 1px solid var(--bg-hover);
        }
        .import-preview-quick-actions {
            display:flex;
            gap:0.35rem;
            flex-wrap:wrap;
            align-items:center;
            padding:0.3rem 0.45rem;
            border:1px solid var(--bg-hover);
            border-radius:0.5rem;
            background: rgba(15, 23, 42, 0.45);
        }
        .import-preview-quick-actions .meta {
            margin-top:0;
            margin-right:0.25rem;
            white-space: nowrap;
        }
        .import-preview-table-wrap { max-height: 360px; overflow: auto; border:1px solid var(--bg-hover); border-radius:0.5rem; margin-top:0.5rem; }
        .import-preview-table { width:100%; border-collapse: collapse; font-size:0.82rem; }
        .import-preview-table th, .import-preview-table td { border-bottom:1px solid var(--bg-hover); padding:0.45rem 0.55rem; text-align:left; vertical-align:top; }
        .import-preview-table th { position: sticky; top: 0; background: var(--bg-card); color: var(--text); z-index: 1; }
        .import-preview-table tbody tr:hover { filter: brightness(1.05); }
        .import-preview-row-overwritten td:first-child { color: var(--warning); }
        .import-preview-row-renamed td:first-child { color: var(--accent); }
        .import-preview-row-skipped td:first-child, .import-preview-row-invalid td:first-child { color: var(--error); }
        .need-row-necessary { background: rgba(16, 185, 129, 0.08); }
        .need-row-review { background: rgba(245, 158, 11, 0.08); }
        .need-row-optional { background: rgba(6, 182, 212, 0.08); }
        .need-row-not-necessary { background: rgba(148, 163, 184, 0.08); }
        .need-chip { display:inline-block; padding:0.2rem 0.45rem; border-radius:999px; font-size:0.76rem; font-weight:600; border:1px solid transparent; }
        .need-necessary { color: var(--success); background: rgba(16, 185, 129, 0.14); border-color: rgba(16, 185, 129, 0.35); }
        .need-review { color: var(--warning); background: rgba(245, 158, 11, 0.16); border-color: rgba(245, 158, 11, 0.35); }
        .need-optional { color: var(--accent); background: rgba(6, 182, 212, 0.14); border-color: rgba(6, 182, 212, 0.35); }
        .need-not-necessary { color: var(--text-dim); background: rgba(148, 163, 184, 0.16); border-color: rgba(148, 163, 184, 0.35); }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Central SRE - RSV360</h1>
            <span id="serviceStatus" class="status-badge status-ok">● Verificando...</span>
            <p class="meta" style="margin-top: 0.5rem;">Deteccao | Monitoramento | Manutencao | Auto-Cura</p>
        </div>
    </header>

    <div class="container">
        <nav class="nav-tabs">
            <button class="nav-tab active" data-tab="dashboard">📊 Dashboard</button>
            <button class="nav-tab" data-tab="central">🛡️ Central SRE</button>
            <button class="nav-tab" data-tab="monitor-total">🧭 Monitoramento Total</button>
            <button class="nav-tab" data-tab="diagnostico">🧠 Diagnóstico</button>
            <button class="nav-tab" data-tab="logs">📁 Logs</button>
            <button class="nav-tab" data-tab="collector">🤖 Coletor Automático</button>
            <button class="nav-tab" data-tab="history">📜 Histórico</button>
        </nav>

        <div id="tab-dashboard" class="tab-panel active">
        <div class="grid grid-2">
            <!-- Disparar análise -->
            <div class="card">
                <div class="card-header">📤 Disparar Análise de Log</div>
                <div class="card-body">
                    <textarea id="logInput" placeholder="Cole aqui o log de erro (Error, Exception, Critical...) ou arraste um arquivo .log"></textarea>
                    <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
                        <button class="btn btn-primary" onclick="triggerAnalysis()">
                            <span id="triggerSpinner" class="hidden spinner"></span>
                            🚀 Analisar
                        </button>
                        <button class="btn btn-ghost" onclick="document.getElementById('logInput').value=''">Limpar</button>
                    </div>
                </div>
            </div>

            <!-- Threads ativos / Pendentes -->
            <div class="card">
                <div class="card-header">
                    ⏳ Análises Ativas
                    <button class="btn btn-ghost" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" onclick="loadStatus()">↻ Atualizar</button>
                </div>
                <div class="card-body" id="threadsContainer">
                    <div class="empty">Carregando...</div>
                </div>
            </div>
        </div>
        </div>

        <div id="tab-central" class="tab-panel">
        <div class="grid grid-2">
            <div class="card">
                <div class="card-header">
                    🩺 Saúde dos Serviços Principais
                    <button class="btn btn-ghost btn-sm" onclick="loadSystemHealth()">↻ Verificar agora</button>
                </div>
                <div class="card-body">
                    <div class="meta" style="margin-bottom: 0.75rem;">
                        Legenda:
                        <span class="status-badge status-ok">● Online</span>
                        <span class="status-badge status-warn" title="Serviço está online e respondendo HTTP, porém a rota raiz '/' retorna 404 (comum em APIs sem endpoint raiz).">● Online sem rota raiz</span>
                        <span class="status-badge status-err">● Offline</span>
                    </div>
                    <div id="systemHealthContainer">
                        <div class="empty">Carregando status...</div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">🧰 Manutenção e Auto-Cura</div>
                <div class="card-body">
                    <p class="meta">A auto-cura leve reinicia o coletor e, se detectar serviço crítico indisponível, dispara reinício do stack.</p>
                    <div style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
                        <button class="btn btn-success" onclick="runAutoHeal('light')">✨ Auto-cura leve</button>
                        <button class="btn btn-danger" onclick="runAutoHeal('full_restart')">♻ Reiniciar stack completo</button>
                    </div>
                    <div id="maintenanceSummary" class="meta" style="margin-top: 1rem;"></div>
                    <div id="maintenanceHistory" class="log-viewer" style="margin-top: 0.75rem; max-height: 220px;">
                        <span class="empty">Sem ações de manutenção ainda</span>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div id="tab-monitor-total" class="tab-panel">
        <div class="grid">
            <div class="card">
                <div class="card-header">
                    🧭 Cobertura Total do Ambiente
                    <button class="btn btn-ghost btn-sm" onclick="loadFullScan()">↻ Rodar varredura completa</button>
                </div>
                <div class="card-body">
                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; margin-bottom:0.75rem;">
                        <select id="fullScanCategory" onchange="applyFullScanFilters()">
                            <option value="all">Todas as categorias</option>
                            <option value="servers">Servidores</option>
                            <option value="microservices">Microserviços</option>
                            <option value="pages">Páginas</option>
                            <option value="functions">Funcionalidades</option>
                        </select>
                        <input id="fullScanSearch" type="text" placeholder="Buscar por rota, nome, URL..." oninput="applyFullScanFilters()" style="padding:0.5rem 0.75rem; background:var(--bg-dark); border:1px solid var(--bg-hover); border-radius:0.5rem; color:var(--text); min-width:280px;" />
                        <label style="display:flex; gap:0.35rem; align-items:center; font-size:0.85rem; color:var(--text-dim);">
                            <input id="fullScanOnlyDown" type="checkbox" onchange="applyFullScanFilters()" />
                            Somente inconsistências
                        </label>
                        <select id="fullScanPageSize" onchange="setFullScanPageSize()">
                            <option value="20">20 rotas/página</option>
                            <option value="50">50 rotas/página</option>
                            <option value="100">100 rotas/página</option>
                        </select>
                        <button class="btn btn-ghost btn-sm" onclick="exportFullScan('json')">⬇ Exportar JSON</button>
                        <button class="btn btn-ghost btn-sm" onclick="exportFullScan('csv')">⬇ Exportar CSV</button>
                        <select id="analyzeMaxItems">
                            <option value="10">Analisar top 10</option>
                            <option value="25" selected>Analisar top 25</option>
                            <option value="50">Analisar top 50</option>
                        </select>
                        <label style="display:flex; gap:0.35rem; align-items:center; font-size:0.85rem; color:var(--text-dim);">
                            <input id="analyzeIncludeLow" type="checkbox" />
                            Incluir severidade baixa
                        </label>
                        <button class="btn btn-primary btn-sm" onclick="analyzeInconsistenciesWithAI()">🤖 Analisar inconsistências com IA</button>
                    </div>
                    <div id="fullScanSummary" class="meta">Executando primeira coleta...</div>
                    <div id="fullScanInconsistencies" class="log-viewer" style="margin-top: 0.75rem; max-height: 180px;">
                        <span class="empty">Sem inconsistências detectadas</span>
                    </div>
                </div>
            </div>

            <div class="grid grid-2">
                <div class="card" id="section-servers">
                    <div class="card-header">🖥️ Servidores</div>
                    <div class="card-body" id="fullScanServers"><div class="empty">Aguardando varredura...</div></div>
                </div>
                <div class="card" id="section-microservices">
                    <div class="card-header">⚙️ Microserviços (32)</div>
                    <div class="card-body" id="fullScanMicroservices"><div class="empty">Aguardando varredura...</div></div>
                </div>
            </div>

            <div class="grid grid-2">
                <div class="card" id="section-pages">
                    <div class="card-header">🌐 Páginas / Rotas mapeadas</div>
                    <div class="card-body">
                        <div id="fullScanPages"><div class="empty">Aguardando varredura...</div></div>
                        <div id="fullScanPagesPagination" class="meta" style="display:flex; justify-content:space-between; align-items:center; gap:0.75rem; margin-top:0.75rem;">
                            <span id="fullScanPagesInfo">Página 1</span>
                            <div style="display:flex; gap:0.5rem;">
                                <button id="fullScanPrevBtn" class="btn btn-ghost btn-sm" onclick="changeFullScanPage(-1)">← Anterior</button>
                                <button id="fullScanNextBtn" class="btn btn-ghost btn-sm" onclick="changeFullScanPage(1)">Próxima →</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="card" id="section-functions">
                    <div class="card-header">🧪 Funcionalidades essenciais</div>
                    <div class="card-body" id="fullScanFunctions"><div class="empty">Aguardando varredura...</div></div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    🤖 Fila de Execuções Automáticas (IA)
                    <button class="btn btn-ghost btn-sm" onclick="loadAutoAnalysisQueue()">↻ Atualizar fila</button>
                </div>
                <div class="card-body">
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; margin-bottom:0.6rem;">
                        <select id="bulkSeverity">
                            <option value="all" selected>Todas severidades</option>
                            <option value="critical">Somente critical</option>
                            <option value="high">Somente high</option>
                            <option value="medium">Somente medium</option>
                            <option value="low">Somente low</option>
                        </select>
                        <select id="bulkMaxItems">
                            <option value="10">Top 10</option>
                            <option value="25" selected>Top 25</option>
                            <option value="50">Top 50</option>
                            <option value="100">Top 100</option>
                        </select>
                        <label style="display:flex; gap:0.35rem; align-items:center; font-size:0.85rem; color:var(--text-dim);">
                            <input id="bulkOnlyPending" type="checkbox" checked />
                            Apenas aguardando aprovação
                        </label>
                        <button class="btn btn-success btn-sm" onclick="bulkAutoAction('approve')">✓ Aprovar em lote</button>
                        <button class="btn btn-danger btn-sm" onclick="bulkAutoAction('reject')">✗ Rejeitar em lote</button>
                    </div>
                    <div id="autoAnalysisSummary" class="meta">Carregando fila...</div>
                    <div id="autoAnalysisQueue" class="log-viewer" style="margin-top:0.75rem; max-height:260px;">
                        <span class="empty">Sem execuções automáticas ainda</span>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div id="tab-diagnostico" class="tab-panel">
        <div class="grid">
            <div class="card">
                <div class="card-header">
                    🧠 Diagnóstico Guiado (explicações e soluções)
                    <button class="btn btn-ghost btn-sm" onclick="loadDiagnosticReport()">↻ Atualizar diagnóstico</button>
                </div>
                <div class="card-body">
                    <p class="meta">Este painel explica o que está acontecendo, por que aconteceu e quais ações práticas tomar (humano + agente).</p>
                    <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                        <button class="btn btn-primary btn-sm" onclick="analyzeInconsistenciesWithAI()">🤖 Enviar inconsistências para IA</button>
                        <button class="btn btn-ghost btn-sm" onclick="loadFullScan()">♻ Recoletar full-scan</button>
                    </div>
                    <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                        <select id="diagFilterServer" onchange="applyDiagnosticFilters()">
                            <option value="all">Servidor: todos</option>
                        </select>
                        <select id="diagFilterCategory" onchange="applyDiagnosticFilters()">
                            <option value="all">Categoria: todas</option>
                            <option value="timeout">Timeout</option>
                            <option value="auth_redirect">Redirecionamento auth</option>
                            <option value="not_found">404 real</option>
                            <option value="offline">Offline</option>
                            <option value="online_sem_rota_raiz">Online sem rota raiz</option>
                        </select>
                        <select id="diagFilterSeverity" onchange="applyDiagnosticFilters()">
                            <option value="all">Severidade: todas</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                        <input id="diagFilterSearch" type="text" placeholder="Buscar rota, erro, location..." oninput="applyDiagnosticFilters()" style="padding:0.5rem 0.75rem; background:var(--bg-dark); border:1px solid var(--bg-hover); border-radius:0.5rem; color:var(--text); min-width:260px;" />
                        <button class="btn btn-ghost btn-sm" onclick="clearDiagnosticFilters()">Limpar filtros</button>
                    </div>
                    <div style="margin-top:0.5rem; display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                        <select id="diagPresetSelect" onchange="applyDiagnosticPreset(this.value)">
                            <option value="">Preset de filtros...</option>
                        </select>
                        <button class="btn btn-ghost btn-sm" onclick="saveCurrentDiagnosticPreset()">💾 Salvar preset atual</button>
                        <button class="btn btn-ghost btn-sm" onclick="deleteSelectedDiagnosticPreset()">🗑️ Remover preset</button>
                        <button class="btn btn-ghost btn-sm" onclick="exportDiagnosticPresets()">⬇ Exportar presets</button>
                        <button class="btn btn-ghost btn-sm" onclick="triggerImportDiagnosticPresets()">⬆ Importar presets</button>
                        <label style="display:flex; gap:0.35rem; align-items:center; font-size:0.85rem; color:var(--text-dim);">
                            Se já existir preset com mesmo nome:
                            <select id="diagImportOverwriteMode">
                                <option value="yes" selected>Sim, sobrescrever</option>
                                <option value="no">Não, manter o atual</option>
                                <option value="rename">Renomear automaticamente</option>
                            </select>
                        </label>
                        <input id="diagPresetsImportInput" type="file" accept="application/json,.json" class="hidden" onchange="importDiagnosticPresets(event)" />
                    </div>
                    <div class="meta" style="margin-top:0.35rem;">
                        Importação: escolha se deseja sobrescrever (Sim), preservar (Não) ou renomear automaticamente em caso de conflito.
                    </div>
                    <div id="diagnosticSummary" class="meta" style="margin-top:0.75rem;">Carregando diagnóstico...</div>
                    <div id="diagnosticFilterInfo" class="meta" style="margin-top:0.35rem;"></div>
                    <div id="diagnosticReport" class="log-viewer" style="margin-top:0.75rem; max-height:460px;">
                        <span class="empty">Aguardando diagnóstico...</span>
                    </div>
                </div>
            </div>
        </div>
        </div>

        <div id="tab-logs" class="tab-panel">
        <div class="card">
            <div class="card-header">📁 Logs do Sistema</div>
            <div class="card-body">
                <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <select id="logFileSelect" onchange="loadLogFile()">
                        <option value="">-- Selecione um arquivo --</option>
                    </select>
                    <button class="btn btn-ghost" onclick="loadLogFiles()">↻ Listar arquivos</button>
                </div>
                <div class="log-viewer" id="logViewer">
                    <span class="empty">Selecione um arquivo de log acima</span>
                </div>
            </div>
        </div>
        </div>

        <div id="tab-collector" class="tab-panel">
        <div class="card">
            <div class="card-header">
                🤖 Coletor Automático
                <div>
                    <button id="collectorStartBtn" class="btn btn-success btn-sm" onclick="collectorStart()">▶ Iniciar</button>
                    <button id="collectorStopBtn" class="btn btn-danger btn-sm hidden" onclick="collectorStop()">■ Parar</button>
                </div>
            </div>
            <div class="card-body">
                <p class="meta" id="collectorStatus">Status: Parado. Clique em Iniciar para monitorar logs em tempo real.</p>
                <p class="meta" id="collectorCount" style="margin-top: 0.25rem;"></p>
                <div id="collectorErrors" style="margin-top: 1rem; max-height: 450px; overflow-y: auto;">
                    <div class="empty">Nenhum erro detectado ainda</div>
                </div>
            </div>
        </div>
        </div>

        <div id="tab-history" class="tab-panel">
        <div class="card">
            <div class="card-header">
                📜 Histórico de Análises
                <button class="btn btn-ghost btn-sm" onclick="loadHistory()">↻ Atualizar</button>
            </div>
            <div class="card-body" id="historyContainer" style="max-height: 450px; overflow-y: auto;">
                <div class="empty">Carregando...</div>
            </div>
        </div>
        </div>
    </div>

    <div id="confirmModal" class="modal-overlay hidden">
        <div class="modal-card">
            <div id="confirmModalTitle" class="modal-title">Confirmar ação</div>
            <div id="confirmModalBody" class="modal-body"></div>
            <div class="meta" style="margin-top:0.5rem;">Atalhos: <strong>Enter</strong> confirma | <strong>Esc</strong> cancela</div>
            <div class="modal-actions">
                <button class="btn btn-ghost" onclick="closeConfirmModal(false)">Cancelar</button>
                <button id="confirmModalActionBtn" class="btn btn-danger" onclick="closeConfirmModal(true)">Confirmar</button>
            </div>
        </div>
    </div>

    <script>
        const API = '';
        const DIAG_FILTERS_STORAGE_KEY = 'rsv360_sre_diag_filters_v1';
        const DIAG_PRESETS_STORAGE_KEY = 'rsv360_sre_diag_presets_v1';
        const DIAG_BUILTIN_PRESETS = {
            timeouts: { label: 'Somente timeouts', filters: { server: 'all', category: 'timeout', severity: 'all', query: '' } },
            auth: { label: 'Somente auth redirect', filters: { server: 'all', category: 'auth_redirect', severity: 'all', query: '' } },
            not_found: { label: 'Somente 404 real', filters: { server: 'all', category: 'not_found', severity: 'all', query: '' } },
            critical: { label: 'Apenas severidade critical', filters: { server: 'all', category: 'all', severity: 'critical', query: '' } },
        };
        let diagnosticCache = null;
        let fullScanCache = null;
        let fullScanPage = 1;
        let fullScanPageSize = 20;
        let confirmModalResolver = null;
        let modalKeydownAttached = false;
        let importPreviewResizeHandler = null;
        function showToast(msg, type = 'success') {
            const t = document.createElement('div');
            t.className = 'toast ' + type;
            t.textContent = msg;
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 4000);
        }

        function openConfirmModal({ title, body, bodyHtml = false, confirmLabel, danger = true, wide = false }) {
            return new Promise((resolve) => {
                confirmModalResolver = resolve;
                document.getElementById('confirmModalTitle').textContent = title || 'Confirmar ação';
                const bodyEl = document.getElementById('confirmModalBody');
                if (bodyHtml) {
                    bodyEl.innerHTML = body || '';
                } else {
                    bodyEl.textContent = body || '';
                }
                const btn = document.getElementById('confirmModalActionBtn');
                btn.textContent = confirmLabel || 'Confirmar';
                btn.className = danger ? 'btn btn-danger' : 'btn btn-success';
                const card = document.querySelector('#confirmModal .modal-card');
                if (card) card.classList.toggle('modal-wide', Boolean(wide));
                document.getElementById('confirmModal').classList.remove('hidden');
                if (!modalKeydownAttached) {
                    document.addEventListener('keydown', onConfirmModalKeydown);
                    modalKeydownAttached = true;
                }
            });
        }

        function closeConfirmModal(confirmed) {
            document.getElementById('confirmModal').classList.add('hidden');
            const card = document.querySelector('#confirmModal .modal-card');
            if (card) card.classList.remove('modal-wide');
            if (importPreviewResizeHandler) {
                window.removeEventListener('resize', importPreviewResizeHandler);
                importPreviewResizeHandler = null;
            }
            if (modalKeydownAttached) {
                document.removeEventListener('keydown', onConfirmModalKeydown);
                modalKeydownAttached = false;
            }
            if (confirmModalResolver) {
                confirmModalResolver(Boolean(confirmed));
                confirmModalResolver = null;
            }
        }

        function updateImportPreviewStickyOffsets() {
            const modal = document.getElementById('confirmModal');
            if (!modal || modal.classList.contains('hidden')) return;
            const card = modal.querySelector('.modal-card');
            const legend = modal.querySelector('.import-preview-legend');
            if (!card || !legend) return;
            const legendHeight = Math.max(legend.getBoundingClientRect().height, 0);
            card.style.setProperty('--import-preview-legend-height', `${Math.ceil(legendHeight)}px`);
        }

        function onConfirmModalKeydown(event) {
            const modal = document.getElementById('confirmModal');
            if (!modal || modal.classList.contains('hidden')) return;
            if (event.key === 'Escape') {
                event.preventDefault();
                closeConfirmModal(false);
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                closeConfirmModal(true);
            }
        }

        async function checkHealth() {
            try {
                const r = await fetch(API + '/health');
                const ok = r.ok;
                const el = document.getElementById('serviceStatus');
                el.textContent = ok ? '● Online' : '● Erro';
                el.className = 'status-badge ' + (ok ? 'status-ok' : 'status-err');
                return ok;
            } catch (e) {
                document.getElementById('serviceStatus').textContent = '● Offline';
                document.getElementById('serviceStatus').className = 'status-badge status-err';
                return false;
            }
        }

        async function loadSystemHealth() {
            try {
                const r = await fetch(API + '/api/system/health');
                const d = await r.json();
                const container = document.getElementById('systemHealthContainer');
                const services = d.services || [];
                if (services.length === 0) {
                    container.innerHTML = '<div class="empty">Nenhum serviço encontrado</div>';
                    return;
                }

                container.innerHTML = services.map(s => {
                    const onlineWithoutRoot = Boolean(s.online_without_root);
                    const badge = onlineWithoutRoot ? 'status-warn' : (s.ok ? 'status-ok' : 'status-err');
                    const statusText = onlineWithoutRoot ? 'Online sem rota raiz' : (s.ok ? 'Online' : 'Offline');
                    const code = s.status_code !== null && s.status_code !== undefined ? s.status_code : '--';
                    const latency = s.latency_ms !== null && s.latency_ms !== undefined ? s.latency_ms + 'ms' : '--';
                    return `<div class="thread-item ${s.ok ? 'completed' : 'error'}">
                        <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                            <div>
                                <strong>${escapeHtml(s.name)}</strong>
                                <div class="meta">${escapeHtml(s.url)}</div>
                            </div>
                            <span class="status-badge ${badge}" title="${onlineWithoutRoot ? 'Serviço online; a rota raiz / não está mapeada (HTTP 404), comportamento esperado para APIs.' : ''}">● ${statusText}</span>
                        </div>
                        <div class="meta" style="margin-top:0.5rem;">HTTP: ${code} | Latência: ${latency}</div>
                        ${onlineWithoutRoot ? '<div class="meta" style="margin-top:0.35rem; color: var(--warning);">Raiz "/" não mapeada neste serviço (esperado para API).</div>' : ''}
                        ${s.error ? `<div class="meta" style="color: var(--error); margin-top: 0.35rem;">${escapeHtml(s.error)}</div>` : ''}
                    </div>`;
                }).join('');
            } catch (e) {
                document.getElementById('systemHealthContainer').innerHTML = '<div class="empty">Erro ao consultar saúde do sistema</div>';
            }
        }

        async function loadMaintenanceHistory() {
            try {
                const r = await fetch(API + '/api/system/maintenance/history');
                const d = await r.json();
                const events = d.events || [];
                document.getElementById('maintenanceSummary').textContent = d.running
                    ? 'Rotina de manutenção em execução...'
                    : 'Pronto para executar ações de manutenção.';
                const box = document.getElementById('maintenanceHistory');
                if (events.length === 0) {
                    box.innerHTML = '<span class="empty">Sem ações de manutenção ainda</span>';
                    return;
                }
                box.innerHTML = events.slice(0, 20).map(ev => {
                    const actions = (ev.actions || []).join(', ') || 'nenhuma ação';
                    return `<div class="history-item">
                        <strong>${escapeHtml(ev.mode || 'light')}</strong> — ${escapeHtml(ev.timestamp || '')}
                        <div class="meta">Ações: ${escapeHtml(actions)}</div>
                    </div>`;
                }).join('');
            } catch (e) {
                document.getElementById('maintenanceHistory').innerHTML = '<span class="empty">Erro ao carregar histórico de manutenção</span>';
            }
        }

        async function runAutoHeal(mode) {
            try {
                const r = await fetch(API + '/api/system/auto-heal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode })
                });
                const d = await r.json();
                if (!r.ok) {
                    showToast(d.message || 'Falha na auto-cura', 'error');
                    return;
                }
                showToast('Auto-cura executada (' + mode + ')');
                loadSystemHealth();
                loadMaintenanceHistory();
            } catch (e) {
                showToast('Erro na auto-cura: ' + e.message, 'error');
            }
        }

        function statusBadge(item) {
            if (item && item.is_timeout) {
                return '<span class="status-badge status-warn" title="Tempo limite excedido ao consultar a rota/serviço. Pode ser compilação inicial, lentidão ou bloqueio momentâneo.">● Timeout</span>';
            }
            if (item && item.is_auth_redirect) {
                return '<span class="status-badge" style="background: rgba(6, 182, 212, 0.2); color: var(--accent);" title="Rota respondeu com redirecionamento para login/autenticação.">● Redirecionamento auth</span>';
            }
            if (item && item.is_not_found) {
                return '<span class="status-badge status-err" title="Rota respondeu 404 real (não encontrada).">● 404 real</span>';
            }
            if (item && item.online_without_root) {
                return '<span class="status-badge status-warn" title="Serviço online; a rota raiz / não está mapeada (HTTP 404), comportamento esperado para APIs.">● Online sem rota raiz</span>';
            }
            const ok = Boolean(item && item.ok);
            return ok
                ? '<span class="status-badge status-ok">● Online</span>'
                : '<span class="status-badge status-err">● Offline</span>';
        }

        function diagnosticCategoryFromStatus(statusLabel) {
            if (statusLabel === 'timeout') return 'timeout';
            if (statusLabel === 'redirecionamento_auth') return 'auth_redirect';
            if (statusLabel === 'not_found') return 'not_found';
            if (statusLabel === 'online_sem_rota_raiz') return 'online_sem_rota_raiz';
            return 'offline';
        }

        function diagnosticSeverityFromCategory(category) {
            if (category === 'offline') return 'critical';
            if (category === 'timeout') return 'high';
            if (category === 'not_found') return 'medium';
            if (category === 'auth_redirect') return 'low';
            return 'low';
        }

        function getStoredDiagnosticFilters() {
            try {
                const raw = localStorage.getItem(DIAG_FILTERS_STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object') return null;
                return parsed;
            } catch (e) {
                return null;
            }
        }

        function getStoredDiagnosticPresets() {
            try {
                const raw = localStorage.getItem(DIAG_PRESETS_STORAGE_KEY);
                if (!raw) return {};
                const parsed = JSON.parse(raw);
                if (!parsed || typeof parsed !== 'object') return {};
                return parsed;
            } catch (e) {
                return {};
            }
        }

        function getDiagnosticFilters() {
            return {
                server: document.getElementById('diagFilterServer')?.value || 'all',
                category: document.getElementById('diagFilterCategory')?.value || 'all',
                severity: document.getElementById('diagFilterSeverity')?.value || 'all',
                query: (document.getElementById('diagFilterSearch')?.value || '').toLowerCase().trim(),
            };
        }

        function saveDiagnosticFilters() {
            try {
                localStorage.setItem(DIAG_FILTERS_STORAGE_KEY, JSON.stringify(getDiagnosticFilters()));
            } catch (e) {
                // Sem persistência disponível (modo privado/política do navegador)
            }
        }

        function saveDiagnosticPresets(presets) {
            try {
                localStorage.setItem(DIAG_PRESETS_STORAGE_KEY, JSON.stringify(presets || {}));
            } catch (e) {
                // Sem persistência disponível
            }
        }

        function normalizeDiagnosticPresetFilters(filters) {
            const f = filters || {};
            return {
                server: String(f.server || 'all'),
                category: String(f.category || 'all'),
                severity: String(f.severity || 'all'),
                query: String(f.query || ''),
            };
        }

        function loadDiagnosticPresetOptions() {
            const sel = document.getElementById('diagPresetSelect');
            if (!sel) return;
            const custom = getStoredDiagnosticPresets();
            const builtinOptions = Object.entries(DIAG_BUILTIN_PRESETS)
                .map(([key, item]) => `<option value="builtin:${escapeHtml(key)}">${escapeHtml(item.label)}</option>`)
                .join('');
            const customOptions = Object.keys(custom)
                .sort((a, b) => a.localeCompare(b))
                .map(name => `<option value="custom:${escapeHtml(name)}">${escapeHtml(name)}</option>`)
                .join('');
            sel.innerHTML = '<option value="">Preset de filtros...</option>' + builtinOptions + customOptions;
        }

        function setDiagnosticFilters(filters) {
            const f = filters || {};
            const server = document.getElementById('diagFilterServer');
            const category = document.getElementById('diagFilterCategory');
            const severity = document.getElementById('diagFilterSeverity');
            const query = document.getElementById('diagFilterSearch');
            if (server) server.value = String(f.server || 'all');
            if (category) category.value = String(f.category || 'all');
            if (severity) severity.value = String(f.severity || 'all');
            if (query) query.value = String(f.query || '');
        }

        function applyDiagnosticPreset(value) {
            if (!value) return;
            let preset = null;
            if (value.startsWith('builtin:')) {
                const key = value.slice('builtin:'.length);
                preset = DIAG_BUILTIN_PRESETS[key]?.filters || null;
            } else if (value.startsWith('custom:')) {
                const name = value.slice('custom:'.length);
                preset = getStoredDiagnosticPresets()[name] || null;
            }
            if (!preset) {
                showToast('Preset inválido.', 'error');
                return;
            }
            setDiagnosticFilters(preset);
            applyDiagnosticFilters();
            showToast('Preset aplicado.');
        }

        function saveCurrentDiagnosticPreset() {
            const name = (window.prompt('Nome do preset personalizado:') || '').trim();
            if (!name) return;
            if (name.length > 60) {
                showToast('Nome muito longo (máx. 60 caracteres).', 'error');
                return;
            }
            const presets = getStoredDiagnosticPresets();
            presets[name] = normalizeDiagnosticPresetFilters(getDiagnosticFilters());
            saveDiagnosticPresets(presets);
            loadDiagnosticPresetOptions();
            const sel = document.getElementById('diagPresetSelect');
            if (sel) sel.value = `custom:${name}`;
            showToast(`Preset "${name}" salvo.`);
        }

        function deleteSelectedDiagnosticPreset() {
            const sel = document.getElementById('diagPresetSelect');
            const value = sel?.value || '';
            if (!value.startsWith('custom:')) {
                showToast('Selecione um preset personalizado para remover.', 'error');
                return;
            }
            const name = value.slice('custom:'.length);
            const presets = getStoredDiagnosticPresets();
            if (!Object.prototype.hasOwnProperty.call(presets, name)) {
                showToast('Preset não encontrado.', 'error');
                return;
            }
            delete presets[name];
            saveDiagnosticPresets(presets);
            loadDiagnosticPresetOptions();
            if (sel) sel.value = '';
            showToast(`Preset "${name}" removido.`);
        }

        function exportDiagnosticPresets() {
            const presets = getStoredDiagnosticPresets();
            const payload = {
                version: 1,
                exported_at: new Date().toISOString(),
                presets,
            };
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            downloadText(`sre-diagnostic-presets-${ts}.json`, JSON.stringify(payload, null, 2), 'application/json');
            showToast('Presets exportados.');
        }

        function triggerImportDiagnosticPresets() {
            const input = document.getElementById('diagPresetsImportInput');
            if (!input) return;
            input.value = '';
            input.click();
        }

        function resolvePresetConflictName(name, existing) {
            const base = String(name || '').trim();
            if (!base) return '';
            if (!Object.prototype.hasOwnProperty.call(existing, base)) return base;
            let idx = 2;
            while (idx < 10000) {
                const candidate = `${base} (${idx})`;
                if (!Object.prototype.hasOwnProperty.call(existing, candidate)) return candidate;
                idx += 1;
            }
            return '';
        }

        function buildDiagnosticImportPlan(source, existing, overwriteMode) {
            const shouldOverwrite = overwriteMode === 'yes';
            const shouldRenameOnConflict = overwriteMode === 'rename';
            const plan = {
                actions: [],
                importedCount: 0,
                overwrittenCount: 0,
                renamedCount: 0,
                skippedCount: 0,
                invalidCount: 0,
                modeLabel: shouldOverwrite ? 'Sim' : (shouldRenameOnConflict ? 'Renomear' : 'Não'),
            };

            const working = { ...(existing || {}) };
            for (const [name, filters] of Object.entries(source || {})) {
                const cleanName = String(name || '').trim();
                if (!cleanName || cleanName.length > 60) {
                    plan.invalidCount += 1;
                    plan.actions.push({
                        action: 'invalid',
                        sourceName: cleanName || '(vazio)',
                        targetName: '',
                        reason: 'Nome inválido (vazio ou maior que 60 caracteres).',
                        filters: normalizeDiagnosticPresetFilters(filters),
                    });
                    continue;
                }
                const alreadyExists = Object.prototype.hasOwnProperty.call(working, cleanName);
                if (alreadyExists && shouldRenameOnConflict) {
                    const resolved = resolvePresetConflictName(cleanName, working);
                    if (!resolved) {
                        plan.skippedCount += 1;
                        plan.actions.push({
                            action: 'skipped',
                            sourceName: cleanName,
                            targetName: cleanName,
                            reason: 'Conflito de nome e não foi possível gerar nome único automático.',
                            filters: normalizeDiagnosticPresetFilters(filters),
                        });
                        continue;
                    }
                    working[resolved] = normalizeDiagnosticPresetFilters(filters);
                    plan.importedCount += 1;
                    plan.renamedCount += 1;
                    plan.actions.push({
                        action: 'renamed',
                        sourceName: cleanName,
                        targetName: resolved,
                        reason: 'Conflito de nome com preset existente; será importado com novo nome.',
                        filters: normalizeDiagnosticPresetFilters(filters),
                    });
                    continue;
                }
                if (alreadyExists && !shouldOverwrite) {
                    plan.skippedCount += 1;
                    plan.actions.push({
                        action: 'skipped',
                        sourceName: cleanName,
                        targetName: cleanName,
                        reason: 'Conflito de nome com preset existente e modo selecionado é "Não".',
                        filters: normalizeDiagnosticPresetFilters(filters),
                    });
                    continue;
                }
                if (alreadyExists && shouldOverwrite) {
                    plan.overwrittenCount += 1;
                    working[cleanName] = normalizeDiagnosticPresetFilters(filters);
                    plan.importedCount += 1;
                    plan.actions.push({
                        action: 'overwritten',
                        sourceName: cleanName,
                        targetName: cleanName,
                        reason: 'Conflito de nome com preset existente e modo selecionado é "Sim".',
                        filters: normalizeDiagnosticPresetFilters(filters),
                    });
                    continue;
                }
                working[cleanName] = normalizeDiagnosticPresetFilters(filters);
                plan.importedCount += 1;
                plan.actions.push({
                    action: 'new',
                    sourceName: cleanName,
                    targetName: cleanName,
                    reason: 'Novo preset sem conflito.',
                    filters: normalizeDiagnosticPresetFilters(filters),
                });
            }

            return plan;
        }

        function buildImportPreviewBody(plan) {
            const lines = [];
            lines.push('Resumo da prévia de importação:');
            lines.push(`- Modo selecionado: ${plan.modeLabel}`);
            lines.push(`- Total que será importado: ${plan.importedCount}`);
            lines.push(`- Serão sobrescritos: ${plan.overwrittenCount}`);
            lines.push(`- Serão renomeados: ${plan.renamedCount}`);
            lines.push(`- Serão ignorados: ${plan.skippedCount}`);
            if (plan.invalidCount > 0) {
                lines.push(`- Inválidos no arquivo: ${plan.invalidCount}`);
            }

            const overwritten = plan.actions.filter(a => a.action === 'overwritten');
            if (overwritten.length > 0) {
                lines.push('');
                lines.push('Presets que SERÃO SOBRESCRITOS (e por quê):');
                overwritten.slice(0, 20).forEach(item => {
                    lines.push(`- ${item.targetName}: ${item.reason}`);
                });
                if (overwritten.length > 20) {
                    lines.push(`- ... e mais ${overwritten.length - 20} item(ns).`);
                }
            }

            const renamed = plan.actions.filter(a => a.action === 'renamed');
            if (renamed.length > 0) {
                lines.push('');
                lines.push('Presets que SERÃO RENOMEADOS (conflito de nome):');
                renamed.slice(0, 20).forEach(item => {
                    lines.push(`- ${item.sourceName} -> ${item.targetName}: ${item.reason}`);
                });
                if (renamed.length > 20) {
                    lines.push(`- ... e mais ${renamed.length - 20} item(ns).`);
                }
            }

            const skipped = plan.actions.filter(a => a.action === 'skipped' || a.action === 'invalid');
            if (skipped.length > 0) {
                lines.push('');
                lines.push('Presets que SERÃO IGNORADOS (e causa):');
                skipped.slice(0, 20).forEach(item => {
                    lines.push(`- ${item.sourceName}: ${item.reason}`);
                });
                if (skipped.length > 20) {
                    lines.push(`- ... e mais ${skipped.length - 20} item(ns).`);
                }
            }

            lines.push('');
            lines.push('Deseja continuar com a importação?');
            return lines.join('\\n');
        }

        function buildImportPreviewHtml(plan) {
            const actionLabel = {
                new: 'Novo',
                overwritten: 'Sobrescrever',
                renamed: 'Renomear',
                skipped: 'Ignorar',
                invalid: 'Inválido',
            };
            const necessityClass = (label) => {
                const v = String(label || '').toLowerCase();
                if (v === 'necessário' || v === 'necessario') return 'need-necessary';
                if (v === 'revisar') return 'need-review';
                if (v === 'opcional') return 'need-optional';
                return 'need-not-necessary';
            };
            const necessityRowClass = (label) => {
                const v = String(label || '').toLowerCase();
                if (v === 'necessário' || v === 'necessario') return 'need-row-necessary';
                if (v === 'revisar') return 'need-row-review';
                if (v === 'opcional') return 'need-row-optional';
                return 'need-row-not-necessary';
            };
            const agentGuidance = (item) => {
                const action = String(item?.action || '');
                if (action === 'new') {
                    return {
                        necessary: 'Necessário',
                        orientation: 'Preset novo sem conflito. Aplicar é recomendado para manter consistência com o arquivo importado.',
                        why: 'Causa: não existe preset com esse nome no sistema.',
                    };
                }
                if (action === 'overwritten') {
                    return {
                        necessary: 'Revisar',
                        orientation: 'Aplicar apenas se o arquivo importado for a fonte de verdade. Se houver customização local importante, desmarque.',
                        why: 'Causa: conflito de nome com preset já existente e modo "Sim, sobrescrever".',
                    };
                }
                if (action === 'renamed') {
                    return {
                        necessary: 'Opcional',
                        orientation: 'Aplicar se você deseja manter ambas as versões. Se for duplicidade desnecessária, desmarque.',
                        why: 'Causa: conflito de nome e modo "Renomear automaticamente".',
                    };
                }
                if (action === 'skipped') {
                    return {
                        necessary: 'Não necessário',
                        orientation: 'Não será aplicado. Só ajuste o modo de importação se quiser alterar esse comportamento.',
                        why: 'Causa: conflito de nome com modo "Não" ou impossibilidade de gerar nome único.',
                    };
                }
                return {
                    necessary: 'Não necessário',
                    orientation: 'Corrija o item no arquivo antes de tentar importar novamente.',
                    why: 'Causa: item inválido para importação.',
                };
            };
            const rows = (plan.actions || []).map((item, idx) => {
                const cls = `import-preview-row-${escapeHtml(String(item.action || 'new'))}`;
                const action = escapeHtml(actionLabel[item.action] || item.action || 'Ação');
                const sourceName = escapeHtml(String(item.sourceName || ''));
                const targetName = escapeHtml(String(item.targetName || ''));
                const reason = escapeHtml(String(item.reason || ''));
                const guidance = agentGuidance(item);
                const necessary = escapeHtml(String(guidance.necessary || 'Revisar'));
                const necessaryClass = necessityClass(guidance.necessary);
                const necessaryRowClass = necessityRowClass(guidance.necessary);
                const orientation = escapeHtml(String(guidance.orientation || ''));
                const why = escapeHtml(String(guidance.why || reason));
                const dataAction = escapeHtml(String(item.action || 'new'));
                const haystack = escapeHtml(
                    `${item.action || ''} ${item.sourceName || ''} ${item.targetName || ''} ${item.reason || ''} ${guidance.orientation || ''} ${guidance.why || ''} ${guidance.necessary || ''}`.toLowerCase()
                );
                const selectable = item.action === 'new' || item.action === 'overwritten' || item.action === 'renamed';
                const check = selectable
                    ? `<input type="checkbox" class="import-preview-apply-check" data-action-index="${idx}" data-necessity="${escapeHtml(String(guidance.necessary || ''))}" checked />`
                    : '<input type="checkbox" disabled />';
                return `<tr class="${cls} ${necessaryRowClass}" data-action="${dataAction}" data-haystack="${haystack}" data-action-index="${idx}">
                    <td>${check}</td>
                    <td>${action}</td>
                    <td>${sourceName}</td>
                    <td>${targetName}</td>
                    <td><span class="need-chip ${necessaryClass}">${necessary}</span></td>
                    <td>${orientation}<div class="meta">${why}</div></td>
                    <td>${reason}</td>
                </tr>`;
            }).join('');

            const causes = [
                'Sobrescrever acontece quando já existe preset com mesmo nome e o modo selecionado é "Sim".',
                'Renomear acontece quando já existe preset com mesmo nome e o modo é "Renomear automaticamente".',
                'Ignorar acontece quando já existe preset com mesmo nome e o modo é "Não", ou quando não foi possível gerar nome único.',
                'Inválido acontece quando o nome do preset no arquivo está vazio ou acima de 60 caracteres.',
            ];

            return `
                <div class="import-preview-summary">
                    <span class="import-preview-chip">Modo: ${escapeHtml(plan.modeLabel || '-')}</span>
                    <span class="import-preview-chip">Importar: ${Number(plan.importedCount || 0)}</span>
                    <span class="import-preview-chip">Sobrescrever: ${Number(plan.overwrittenCount || 0)}</span>
                    <span class="import-preview-chip">Renomear: ${Number(plan.renamedCount || 0)}</span>
                    <span class="import-preview-chip">Ignorar: ${Number(plan.skippedCount || 0)}</span>
                    <span class="import-preview-chip">Inválidos: ${Number(plan.invalidCount || 0)}</span>
                </div>
                <div class="import-preview-legend">
                    <strong style="font-size:0.8rem; color: var(--text-dim);">Legenda:</strong>
                    <span class="need-chip need-necessary">Necessário</span>
                    <span class="need-chip need-review">Revisar</span>
                    <span class="need-chip need-optional">Opcional</span>
                    <span class="need-chip need-not-necessary">Não necessário</span>
                </div>
                <div class="meta">Prévia detalhada do que vai acontecer antes da importação:</div>
                <div class="meta" style="margin-top:0.35rem;">
                    Passo a passo robusto do agente: (1) calcular conflitos e causas, (2) você marca/desmarca o que deseja aplicar, (3) confirmar no modal, (4) aplicar somente itens marcados.
                </div>
                <div class="import-preview-filters">
                    <select id="importPreviewActionFilter">
                        <option value="all">Ação: todas</option>
                        <option value="overwritten">Somente sobrescrever</option>
                        <option value="renamed">Somente renomear</option>
                        <option value="skipped">Somente ignorar</option>
                        <option value="invalid">Somente inválidos</option>
                        <option value="new">Somente novos</option>
                    </select>
                    <input id="importPreviewSearch" type="text" placeholder="Buscar por nome/causa..." style="padding:0.45rem 0.65rem; background:var(--bg-dark); border:1px solid var(--bg-hover); border-radius:0.5rem; color:var(--text); min-width:240px;" />
                    <div class="import-preview-quick-actions">
                        <span class="meta">Ações rápidas:</span>
                        <button class="btn btn-ghost btn-sm" id="importPreviewSelectAllBtn">Marcar todos</button>
                        <button class="btn btn-ghost btn-sm" id="importPreviewDeselectAllBtn">Desmarcar todos</button>
                        <button class="btn btn-ghost btn-sm" id="importPreviewSelectNecessaryBtn">Só Necessários</button>
                        <button class="btn btn-ghost btn-sm" id="importPreviewDeselectReviewOptionalBtn">Desmarcar Revisar/Opcional</button>
                    </div>
                    <span id="importPreviewFilterInfo" class="meta"></span>
                </div>
                <div class="import-preview-table-wrap">
                    <table class="import-preview-table">
                        <thead>
                            <tr>
                                <th>Aplicar</th>
                                <th>Ação</th>
                                <th>Preset no arquivo</th>
                                <th>Resultado no sistema</th>
                                <th>Necessário?</th>
                                <th>Orientação do agente (porquê/causa)</th>
                                <th>Por que isso vai acontecer (causa)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows || '<tr><td colspan="7">Nenhuma ação calculada.</td></tr>'}
                        </tbody>
                    </table>
                </div>
                <div class="meta" style="margin-top:0.6rem;">
                    <strong>Causas possíveis:</strong><br/>
                    ${causes.map(c => `- ${escapeHtml(c)}`).join('<br/>')}
                </div>
                <div class="meta" style="margin-top:0.6rem;">Deseja continuar com a importação?</div>
            `;
        }

        function bindImportPreviewFilters() {
            const actionSel = document.getElementById('importPreviewActionFilter');
            const searchInput = document.getElementById('importPreviewSearch');
            const info = document.getElementById('importPreviewFilterInfo');
            const rows = Array.from(document.querySelectorAll('.import-preview-table tbody tr'));
            if (!actionSel || !searchInput || rows.length === 0) return;
            const checks = Array.from(document.querySelectorAll('.import-preview-apply-check'));
            const selectAllBtn = document.getElementById('importPreviewSelectAllBtn');
            const deselectAllBtn = document.getElementById('importPreviewDeselectAllBtn');
            const selectNecessaryBtn = document.getElementById('importPreviewSelectNecessaryBtn');
            const deselectReviewOptionalBtn = document.getElementById('importPreviewDeselectReviewOptionalBtn');
            requestAnimationFrame(updateImportPreviewStickyOffsets);
            if (importPreviewResizeHandler) {
                window.removeEventListener('resize', importPreviewResizeHandler);
            }
            importPreviewResizeHandler = () => requestAnimationFrame(updateImportPreviewStickyOffsets);
            window.addEventListener('resize', importPreviewResizeHandler);

            const apply = () => {
                const action = actionSel.value || 'all';
                const query = String(searchInput.value || '').toLowerCase().trim();
                let visible = 0;
                rows.forEach(row => {
                    const rowAction = row.getAttribute('data-action') || '';
                    const haystack = (row.getAttribute('data-haystack') || '').toLowerCase();
                    const actionMatch = action === 'all' || rowAction === action;
                    const queryMatch = !query || haystack.includes(query);
                    const show = actionMatch && queryMatch;
                    row.style.display = show ? '' : 'none';
                    if (show) visible += 1;
                });
                const selected = checks.filter(c => c.checked).length;
                if (info) {
                    info.textContent = `Linhas exibidas: ${visible}/${rows.length} | Itens marcados para aplicar: ${selected}`;
                }
            };

            actionSel.onchange = apply;
            searchInput.oninput = apply;
            checks.forEach(c => { c.onchange = apply; });
            if (selectAllBtn) {
                selectAllBtn.onclick = (e) => {
                    e.preventDefault();
                    checks.forEach(c => { c.checked = true; });
                    apply();
                };
            }
            if (deselectAllBtn) {
                deselectAllBtn.onclick = (e) => {
                    e.preventDefault();
                    checks.forEach(c => { c.checked = false; });
                    apply();
                };
            }
            if (selectNecessaryBtn) {
                selectNecessaryBtn.onclick = (e) => {
                    e.preventDefault();
                    checks.forEach(c => {
                        const n = String(c.getAttribute('data-necessity') || '').toLowerCase();
                        c.checked = (n === 'necessário' || n === 'necessario');
                    });
                    apply();
                };
            }
            if (deselectReviewOptionalBtn) {
                deselectReviewOptionalBtn.onclick = (e) => {
                    e.preventDefault();
                    checks.forEach(c => {
                        const n = String(c.getAttribute('data-necessity') || '').toLowerCase();
                        if (n === 'revisar' || n === 'opcional') c.checked = false;
                    });
                    apply();
                };
            }
            apply();
        }

        function getSelectedImportActionIndexes() {
            const checks = Array.from(document.querySelectorAll('.import-preview-apply-check'));
            const selected = new Set();
            checks.forEach(c => {
                if (c.checked) {
                    const raw = c.getAttribute('data-action-index');
                    const idx = Number(raw);
                    if (Number.isFinite(idx)) selected.add(idx);
                }
            });
            return selected;
        }

        async function importDiagnosticPresets(event) {
            try {
                const file = event?.target?.files?.[0];
                if (!file) return;
                const text = await file.text();
                const overwriteMode = document.getElementById('diagImportOverwriteMode')?.value || 'yes';
                const parsed = JSON.parse(text);
                const source = parsed && typeof parsed === 'object' && parsed.presets && typeof parsed.presets === 'object'
                    ? parsed.presets
                    : (parsed && typeof parsed === 'object' ? parsed : null);
                if (!source || typeof source !== 'object') {
                    showToast('Arquivo inválido para importação de presets.', 'error');
                    return;
                }

                const existing = getStoredDiagnosticPresets();
                const plan = buildDiagnosticImportPlan(source, existing, overwriteMode);
                if (plan.importedCount === 0) {
                    showToast(
                        overwriteMode === 'yes'
                            ? 'Nenhum preset válido encontrado no arquivo.'
                            : (overwriteMode === 'rename'
                                ? 'Nenhum preset válido pôde ser renomeado/importado.'
                                : 'Nenhum preset novo importado (todos já existiam e sobrescrita está em "Não").'),
                        'error'
                    );
                    return;
                }

                const confirmPromise = openConfirmModal({
                    title: 'Confirmar importação de presets',
                    body: buildImportPreviewHtml(plan),
                    bodyHtml: true,
                    confirmLabel: 'Importar presets',
                    danger: plan.overwrittenCount > 0,
                    wide: true,
                });
                bindImportPreviewFilters();
                const confirmed = await confirmPromise;
                if (!confirmed) {
                    showToast('Importação cancelada.');
                    return;
                }

                const result = { ...(existing || {}) };
                const selectedIndexes = getSelectedImportActionIndexes();
                let uncheckedCount = 0;
                let appliedTotal = 0;
                let appliedOverwritten = 0;
                let appliedRenamed = 0;
                let appliedNew = 0;
                for (let i = 0; i < plan.actions.length; i += 1) {
                    const action = plan.actions[i];
                    const isApplicable = action.action === 'new' || action.action === 'overwritten' || action.action === 'renamed';
                    if (!isApplicable) continue;
                    if (!selectedIndexes.has(i)) {
                        uncheckedCount += 1;
                        continue;
                    }
                    result[action.targetName] = normalizeDiagnosticPresetFilters(action.filters);
                    appliedTotal += 1;
                    if (action.action === 'overwritten') appliedOverwritten += 1;
                    if (action.action === 'renamed') appliedRenamed += 1;
                    if (action.action === 'new') appliedNew += 1;
                }
                if (appliedTotal <= 0) {
                    showToast('Nenhum item marcado para importar. Operação cancelada.', 'error');
                    return;
                }
                saveDiagnosticPresets(result);
                loadDiagnosticPresetOptions();
                showToast(
                    `Importação concluída: ${appliedTotal} preset(s)` +
                    ` | novos=${appliedNew}` +
                    ` | sobrescritos=${appliedOverwritten}` +
                    ` | renomeados=${appliedRenamed}` +
                    ` | ignorados=${plan.skippedCount}` +
                    ` | desmarcados=${uncheckedCount}` +
                    ` | modo=${plan.modeLabel}`
                );
            } catch (e) {
                showToast('Falha ao importar presets: ' + e.message, 'error');
            }
        }

        function loadDiagnosticFiltersFromStorage() {
            const saved = getStoredDiagnosticFilters();
            if (!saved) return;
            const server = document.getElementById('diagFilterServer');
            const category = document.getElementById('diagFilterCategory');
            const severity = document.getElementById('diagFilterSeverity');
            const query = document.getElementById('diagFilterSearch');
            if (server && saved.server) server.value = String(saved.server);
            if (category && saved.category) category.value = String(saved.category);
            if (severity && saved.severity) severity.value = String(saved.severity);
            if (query && typeof saved.query === 'string') query.value = saved.query;
        }

        function clearDiagnosticFilters() {
            const ids = ['diagFilterServer', 'diagFilterCategory', 'diagFilterSeverity'];
            ids.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = 'all';
            });
            const q = document.getElementById('diagFilterSearch');
            if (q) q.value = '';
            applyDiagnosticFilters();
        }

        function fillDiagnosticServerOptions(data) {
            const sel = document.getElementById('diagFilterServer');
            if (!sel) return;
            const saved = getStoredDiagnosticFilters() || {};
            const current = sel.value || saved.server || 'all';
            const servers = (data.per_server || []).map(s => String(s.server || '')).filter(Boolean);
            sel.innerHTML =
                '<option value="all">Servidor: todos</option>' +
                servers.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
            if (servers.includes(current)) {
                sel.value = current;
            } else {
                sel.value = 'all';
            }
        }

        function applyDiagnosticFilters() {
            if (!diagnosticCache) return;
            saveDiagnosticFilters();
            renderDiagnosticReport(diagnosticCache);
        }

        function renderDiagnosticReport(d) {
            const filters = getDiagnosticFilters();
            const s = d.summary || {};
            const pageCat = d.page_categories || {};
            const pageCounts = pageCat.counts || {};
            const pagePct = pageCat.percentages || {};
            document.getElementById('diagnosticSummary').textContent =
                `servers_down=${s.servers_down || 0} | microservices_down=${s.microservices_down || 0} | pages_down=${s.pages_down || 0} | timeout=${s.pages_timeout || 0} | auth_redirect=${s.pages_auth_redirect || 0} | not_found=${s.pages_not_found || 0} | functions_down=${s.functions_down || 0}`;

            const causes = (d.likely_causes || []).map(x => `<li>${escapeHtml(x)}</li>`).join('');
            const recs = (d.recommendations || []).map(x => `<li>${escapeHtml(x)}</li>`).join('');
            const learning = (d.learning_notes || []).map(x => `<li>${escapeHtml(x)}</li>`).join('');

            const routesFiltered = (d.top_impacted_routes || []).filter(x => {
                const category = diagnosticCategoryFromStatus(String(x.status_label || 'offline'));
                const severity = diagnosticSeverityFromCategory(category);
                const server = String(x.url || '').replace(/^https?:\\/\\//, '').split('/')[0];
                const text = `${x.route || ''} ${x.url || ''} ${x.location || ''} ${x.error || ''} ${category} ${severity}`.toLowerCase();
                if (filters.server !== 'all' && server !== filters.server) return false;
                if (filters.category !== 'all' && category !== filters.category) return false;
                if (filters.severity !== 'all' && severity !== filters.severity) return false;
                if (filters.query && !text.includes(filters.query)) return false;
                return true;
            });

            const routes = routesFiltered.map(x => {
                const route = escapeHtml(String(x.route || ''));
                const status = escapeHtml(String(x.status_label || 'offline'));
                const code = escapeHtml(String(x.status_code ?? '--'));
                const latency = escapeHtml(String(x.latency_ms ?? '--'));
                const location = escapeHtml(String(x.location || ''));
                const err = escapeHtml(String(x.error || ''));
                const url = escapeHtml(String(x.url || ''));
                return `<li><strong>${route}</strong> — status=${status}, HTTP=${code}, latência=${latency}ms ${url ? `| url=${url}` : ''} ${location ? `| location=${location}` : ''} ${err ? `| erro=${err}` : ''}</li>`;
            }).join('');

            let shownItems = 0;
            const perServer = (d.per_server || []).map(srv => {
                const serverName = String(srv.server || 'desconhecido');
                if (filters.server !== 'all' && serverName !== filters.server) return '';
                const issues = srv.issues || {};
                const filteredItems = (srv.items || []).filter(it => {
                    const category = String(it.category || 'offline');
                    const severity = diagnosticSeverityFromCategory(category);
                    const text = `${it.type || ''} ${it.name || ''} ${it.url || ''} ${it.location || ''} ${it.error || ''} ${category} ${severity}`.toLowerCase();
                    if (filters.category !== 'all' && category !== filters.category) return false;
                    if (filters.severity !== 'all' && severity !== filters.severity) return false;
                    if (filters.query && !text.includes(filters.query)) return false;
                    return true;
                });
                if (filteredItems.length === 0 && (filters.category !== 'all' || filters.severity !== 'all' || filters.query)) return '';
                shownItems += filteredItems.length;
                const items = filteredItems.map(it => {
                    const name = escapeHtml(String(it.name || ''));
                    const itType = escapeHtml(String(it.type || 'item'));
                    const cat = escapeHtml(String(it.category || 'unknown'));
                    const sev = escapeHtml(diagnosticSeverityFromCategory(String(it.category || 'offline')));
                    const code = escapeHtml(String(it.status_code ?? '--'));
                    const lat = escapeHtml(String(it.latency_ms ?? '--'));
                    const loc = escapeHtml(String(it.location || ''));
                    const err = escapeHtml(String(it.error || ''));
                    return `<li><strong>${itType}</strong> ${name} — cat=${cat}, sev=${sev}, HTTP=${code}, lat=${lat}ms ${loc ? `| location=${loc}` : ''} ${err ? `| erro=${err}` : ''}</li>`;
                }).join('');
                return `
                    <div class="history-item">
                        <strong>Servidor ${escapeHtml(serverName)}</strong>
                        <div class="meta">total=${srv.total || 0} | ok=${srv.ok || 0} | timeout=${issues.timeout || 0} | auth_redirect=${issues.auth_redirect || 0} | not_found=${issues.not_found || 0} | offline=${issues.offline || 0}</div>
                        <ul style="margin-top:0.4rem; padding-left:1rem;">${items || '<li>Sem inconsistências neste servidor.</li>'}</ul>
                    </div>
                `;
            }).join('');

            const info = document.getElementById('diagnosticFilterInfo');
            if (info) {
                info.textContent = `Filtros ativos -> servidor=${filters.server}, categoria=${filters.category}, severidade=${filters.severity}, busca="${filters.query || '-'}" | rotas exibidas=${routesFiltered.length} | itens por servidor exibidos=${shownItems}`;
            }

            const agent = d.agent_actions || {};
            const payload = escapeHtml(JSON.stringify(agent.suggested_payload || {}, null, 2));

            document.getElementById('diagnosticReport').innerHTML = `
                <div class="history-item"><strong>Percentuais por categoria (rotas mapeadas)</strong>
                    <div class="meta" style="margin-top:0.35rem;">
                        total=${pageCat.total_pages || 0}
                        | timeout=${pageCounts.timeout || 0} (${pagePct.timeout ?? 0}%)
                        | auth_redirect=${pageCounts.auth_redirect || 0} (${pagePct.auth_redirect ?? 0}%)
                        | not_found=${pageCounts.not_found || 0} (${pagePct.not_found ?? 0}%)
                        | offline=${pageCounts.offline || 0} (${pagePct.offline ?? 0}%)
                        | online=${pageCounts.online || 0} (${pagePct.online ?? 0}%)
                    </div>
                </div>
                <div class="history-item"><strong>Causas prováveis</strong><ul style="margin-top:0.4rem; padding-left:1rem;">${causes || '<li>Sem causas identificadas.</li>'}</ul></div>
                <div class="history-item"><strong>Rotas mais impactadas</strong><ul style="margin-top:0.4rem; padding-left:1rem;">${routes || '<li>Nenhuma rota impactada para os filtros selecionados.</li>'}</ul></div>
                <div class="history-item"><strong>Separação por servidor (onde e por que)</strong></div>
                ${perServer || '<div class="history-item"><span class="empty">Sem dados por servidor para os filtros selecionados.</span></div>'}
                <div class="history-item"><strong>Como corrigir</strong><ul style="margin-top:0.4rem; padding-left:1rem;">${recs || '<li>Sem recomendações.</li>'}</ul></div>
                <div class="history-item"><strong>Como aprender com o incidente</strong><ul style="margin-top:0.4rem; padding-left:1rem;">${learning || '<li>Sem notas de aprendizado.</li>'}</ul></div>
                <div class="history-item"><strong>Ação sugerida para agente</strong>
                    <div class="meta" style="margin-top:0.35rem;">API: ${escapeHtml(String(agent.suggested_api || ''))}</div>
                    <pre style="margin-top:0.35rem; font-size:0.8rem;">${payload}</pre>
                    <div class="meta">${escapeHtml(String(agent.next_step || ''))}</div>
                </div>
            `;
        }

        async function loadDiagnosticReport() {
            try {
                const r = await fetch(API + '/api/system/diagnostic-report');
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Falha ao carregar diagnóstico');
                diagnosticCache = d;
                fillDiagnosticServerOptions(d);
                renderDiagnosticReport(d);
            } catch (e) {
                document.getElementById('diagnosticSummary').textContent = 'Erro ao gerar diagnóstico.';
                document.getElementById('diagnosticReport').innerHTML = `<span class="empty">${escapeHtml(String(e.message || e))}</span>`;
            }
        }

        function renderScanList(items, mapFn) {
            if (!items || items.length === 0) return '<div class="empty">Sem dados</div>';
            return items.map(mapFn).join('');
        }

        function normalizeText(v) {
            return String(v || '').toLowerCase();
        }

        function filterItems(items, onlyDown, query, fieldsFn) {
            const q = normalizeText(query).trim();
            return (items || []).filter(item => {
                if (onlyDown && item.ok) return false;
                if (!q) return true;
                const haystack = normalizeText(fieldsFn(item));
                return haystack.includes(q);
            });
        }

        function toCsv(data) {
            const rows = [['categoria', 'nome', 'url', 'status_code', 'ok', 'latency_ms', 'extra']];
            const push = (cat, name, url, statusCode, ok, latency, extra) => {
                rows.push([cat, name, url || '', String(statusCode ?? ''), String(Boolean(ok)), String(latency ?? ''), extra || '']);
            };
            (data.servers || []).forEach(s => push('servidor', s.name, s.url, s.status_code, s.ok, s.latency_ms, s.critical ? 'critical' : 'non-critical'));
            (data.microservices || []).forEach(s => push('microservico', s.name, s.url, s.status_code, s.ok, s.latency_ms, `porta:${s.port}`));
            (data.pages || []).forEach(p => push('pagina', p.route, p.url, p.status_code, p.ok, p.latency_ms, ''));
            (data.functional_checks || []).forEach(f => push('funcionalidade', f.name, f.url, f.status_code, f.ok, f.latency_ms, ''));
            return rows
                .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
                .join('\\n');
        }

        function downloadText(filename, content, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }

        function exportFullScan(format) {
            if (!fullScanCache) {
                showToast('Rode a varredura antes de exportar.', 'error');
                return;
            }
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            if (format === 'json') {
                downloadText(`sre-full-scan-${ts}.json`, JSON.stringify(fullScanCache, null, 2), 'application/json');
                return;
            }
            if (format === 'csv') {
                downloadText(`sre-full-scan-${ts}.csv`, toCsv(fullScanCache), 'text/csv');
                return;
            }
            showToast('Formato inválido para exportação.', 'error');
        }

        function setFullScanPageSize() {
            const v = Number(document.getElementById('fullScanPageSize')?.value || 20);
            fullScanPageSize = Number.isFinite(v) && v > 0 ? v : 20;
            fullScanPage = 1;
            applyFullScanFilters();
        }

        function changeFullScanPage(delta) {
            fullScanPage = Math.max(1, fullScanPage + delta);
            applyFullScanFilters();
        }

        async function analyzeInconsistenciesWithAI() {
            try {
                if (!fullScanCache) {
                    await loadFullScan();
                }
                const maxItems = Number(document.getElementById('analyzeMaxItems')?.value || 25);
                const includeLow = Boolean(document.getElementById('analyzeIncludeLow')?.checked);

                const r = await fetch(API + '/api/system/analyze-inconsistencies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ max_items: maxItems, include_low: includeLow })
                });
                const d = await r.json();
                if (!r.ok) {
                    showToast(d.message || 'Falha ao iniciar análise automática', 'error');
                    return;
                }
                showToast(`Análise IA iniciada: ${d.triggered_count} item(ns) disparado(s)`);
                loadStatus();
                loadHistory();
                loadAutoAnalysisQueue();
                document.querySelector('[data-tab="dashboard"]').click();
            } catch (e) {
                showToast('Erro ao iniciar análise automática: ' + e.message, 'error');
            }
        }

        function queueStatusBadge(status) {
            if (status === 'concluido') return '<span class="status-badge status-ok">● concluido</span>';
            if (status === 'erro') return '<span class="status-badge status-err">● erro</span>';
            if (status === 'aguardando_aprovacao') return '<span class="status-badge" style="background: rgba(245, 158, 11, 0.2); color: var(--warning);">● aguardando_aprovacao</span>';
            return '<span class="status-badge" style="background: rgba(6, 182, 212, 0.2); color: var(--accent);">● executando</span>';
        }

        async function loadAutoAnalysisQueue() {
            try {
                const r = await fetch(API + '/api/system/auto-analysis-status?limit=100');
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Falha ao carregar fila');

                const summary = d.summary || {};
                document.getElementById('autoAnalysisSummary').textContent =
                    `executando=${summary.executando || 0} | aguardando_aprovacao=${summary.aguardando_aprovacao || 0} | concluido=${summary.concluido || 0} | erro=${summary.erro || 0}`;

                const items = d.items || [];
                const box = document.getElementById('autoAnalysisQueue');
                if (items.length === 0) {
                    box.innerHTML = '<span class="empty">Sem execuções automáticas ainda</span>';
                    return;
                }

                box.innerHTML = items.map(it => `
                    <div class="thread-item ${it.status === 'erro' ? 'error' : (it.status === 'concluido' ? 'completed' : 'pending')}">
                        <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                            <div>
                                <strong>${escapeHtml(it.title || it.thread_id)}</strong>
                                <div class="meta">${escapeHtml(it.thread_id)} | severidade=${escapeHtml(it.severity || '')}</div>
                                <div class="meta">criado=${escapeHtml(it.created_at || '')} | atualizado=${escapeHtml(it.updated_at || '')}</div>
                                ${it.error ? `<div class="meta" style="color: var(--error);">${escapeHtml(it.error)}</div>` : ''}
                                ${it.status === 'aguardando_aprovacao' ? `
                                    <div style="margin-top:0.6rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                                        <button class="btn btn-success btn-sm" onclick="approveAutoThread('${it.thread_id}')">✓ Aprovar</button>
                                        <button class="btn btn-danger btn-sm" onclick="rejectAutoThread('${it.thread_id}')">✗ Rejeitar</button>
                                    </div>
                                ` : ''}
                            </div>
                            ${queueStatusBadge(it.status)}
                        </div>
                    </div>
                `).join('');
            } catch (e) {
                document.getElementById('autoAnalysisSummary').textContent = 'Erro ao carregar fila de execuções automáticas.';
                document.getElementById('autoAnalysisQueue').innerHTML = `<span class="empty">${escapeHtml(String(e.message || e))}</span>`;
            }
        }

        async function bulkAutoAction(action) {
            try {
                const severity = document.getElementById('bulkSeverity')?.value || 'all';
                const maxItems = Number(document.getElementById('bulkMaxItems')?.value || 25);
                const onlyPending = Boolean(document.getElementById('bulkOnlyPending')?.checked);
                const actionLabel = action === 'approve' ? 'aprovar' : 'rejeitar';
                const confirmed = await openConfirmModal({
                    title: `Confirmar ${actionLabel} em lote`,
                    body:
                        `Você está prestes a ${actionLabel} itens da fila automática.\n` +
                        `Severidade: ${severity}\n` +
                        `Limite: ${maxItems}\n` +
                        `Apenas aguardando aprovação: ${onlyPending ? 'sim' : 'não'}`,
                    confirmLabel: action === 'approve' ? 'Confirmar aprovação' : 'Confirmar rejeição',
                    danger: action !== 'approve',
                });
                if (!confirmed) {
                    showToast('Ação em lote cancelada.');
                    return;
                }

                const r = await fetch(API + '/api/system/auto-analysis-bulk-action', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action,
                        severity,
                        max_items: maxItems,
                        only_pending: onlyPending,
                    })
                });
                const d = await r.json();
                if (!r.ok) {
                    showToast(d.message || 'Falha na ação em lote', 'error');
                    return;
                }
                showToast(`Lote ${action}: processados ${d.processed_count}, erros ${d.error_count}`);
                loadAutoAnalysisQueue();
                loadStatus();
                loadHistory();
            } catch (e) {
                showToast('Erro na ação em lote: ' + e.message, 'error');
            }
        }

        async function approveAutoThread(threadId) {
            try {
                const r = await fetch(API + '/approve/' + threadId, { method: 'POST' });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Falha ao aprovar');
                showToast(`Aprovado: ${threadId}`);
                loadAutoAnalysisQueue();
                loadStatus();
                loadHistory();
            } catch (e) {
                showToast('Erro ao aprovar item: ' + e.message, 'error');
            }
        }

        async function rejectAutoThread(threadId) {
            try {
                const r = await fetch(API + '/reject/' + threadId, { method: 'POST' });
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Falha ao rejeitar');
                showToast(`Rejeitado: ${threadId}`);
                loadAutoAnalysisQueue();
                loadStatus();
                loadHistory();
            } catch (e) {
                showToast('Erro ao rejeitar item: ' + e.message, 'error');
            }
        }

        function applyFullScanFilters() {
            if (!fullScanCache) return;

            const category = document.getElementById('fullScanCategory')?.value || 'all';
            const query = document.getElementById('fullScanSearch')?.value || '';
            const onlyDown = Boolean(document.getElementById('fullScanOnlyDown')?.checked);

            const setVisible = (id, visible) => {
                const el = document.getElementById(id);
                if (el) el.style.display = visible ? '' : 'none';
            };
            setVisible('section-servers', category === 'all' || category === 'servers');
            setVisible('section-microservices', category === 'all' || category === 'microservices');
            setVisible('section-pages', category === 'all' || category === 'pages');
            setVisible('section-functions', category === 'all' || category === 'functions');

            const servers = filterItems(fullScanCache.servers, onlyDown, query, i => `${i.name} ${i.url}`);
            const micros = filterItems(fullScanCache.microservices, onlyDown, query, i => `${i.name} ${i.url} ${i.port}`);
            const pages = filterItems(fullScanCache.pages, onlyDown, query, i => `${i.route} ${i.url}`);
            const funcs = filterItems(fullScanCache.functional_checks, onlyDown, query, i => `${i.name} ${i.url}`);
            const inconsistencies = filterItems(fullScanCache.inconsistencies || [], false, query, i => i);

            document.getElementById('fullScanServers').innerHTML = renderScanList(servers, s => `
                <div class="thread-item ${s.ok ? 'completed' : 'error'}">
                    <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                        <div><strong>${escapeHtml(s.name)}</strong><div class="meta">${escapeHtml(s.url)}</div></div>
                        ${statusBadge(s)}
                    </div>
                    <div class="meta">HTTP: ${s.status_code ?? '--'} | Latência: ${s.latency_ms ?? '--'}ms</div>
                    ${s.error ? `<div class="meta" style="color: var(--error);">${escapeHtml(s.error)}</div>` : ''}
                </div>
            `);
            document.getElementById('fullScanMicroservices').innerHTML = renderScanList(micros, s => `
                <div class="thread-item ${s.ok ? 'completed' : 'error'}">
                    <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                        <div><strong>${escapeHtml(s.name)}</strong><div class="meta">porta ${s.port} | ${escapeHtml(s.url)}</div></div>
                        ${statusBadge(s)}
                    </div>
                    <div class="meta">HTTP: ${s.status_code ?? '--'} | Latência: ${s.latency_ms ?? '--'}ms</div>
                    ${s.error ? `<div class="meta" style="color: var(--error);">${escapeHtml(s.error)}</div>` : ''}
                </div>
            `);
            const totalPages = Math.max(1, Math.ceil(pages.length / fullScanPageSize));
            if (fullScanPage > totalPages) fullScanPage = totalPages;
            const start = (fullScanPage - 1) * fullScanPageSize;
            const pagedPages = pages.slice(start, start + fullScanPageSize);

            document.getElementById('fullScanPages').innerHTML = renderScanList(pagedPages, p => `
                <div class="thread-item ${p.ok ? 'completed' : 'error'}">
                    <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                        <div><strong>${escapeHtml(p.route)}</strong><div class="meta">${escapeHtml(p.url)}</div></div>
                        ${statusBadge(p)}
                    </div>
                    <div class="meta">HTTP: ${p.status_code ?? '--'} | Latência: ${p.latency_ms ?? '--'}ms</div>
                    ${p.error ? `<div class="meta" style="color: var(--error);">${escapeHtml(p.error)}</div>` : ''}
                </div>
            `);
            const infoEl = document.getElementById('fullScanPagesInfo');
            if (infoEl) infoEl.textContent = `Página ${fullScanPage} de ${totalPages} (${pages.length} rotas filtradas)`;
            const prevBtn = document.getElementById('fullScanPrevBtn');
            const nextBtn = document.getElementById('fullScanNextBtn');
            if (prevBtn) prevBtn.disabled = fullScanPage <= 1;
            if (nextBtn) nextBtn.disabled = fullScanPage >= totalPages;
            document.getElementById('fullScanFunctions').innerHTML = renderScanList(funcs, f => `
                <div class="thread-item ${f.ok ? 'completed' : 'error'}">
                    <div style="display:flex; justify-content:space-between; gap:1rem; align-items:flex-start;">
                        <div><strong>${escapeHtml(f.name)}</strong><div class="meta">${escapeHtml(f.url)}</div></div>
                        ${statusBadge(f)}
                    </div>
                    <div class="meta">HTTP: ${f.status_code ?? '--'} | Latência: ${f.latency_ms ?? '--'}ms</div>
                    ${f.error ? `<div class="meta" style="color: var(--error);">${escapeHtml(f.error)}</div>` : ''}
                </div>
            `);

            const incBox = document.getElementById('fullScanInconsistencies');
            if (inconsistencies.length === 0) {
                incBox.innerHTML = '<span class="empty">Sem inconsistências detectadas no momento</span>';
            } else {
                incBox.innerHTML = inconsistencies.map(i => `<div class="history-item">${escapeHtml(i)}</div>`).join('');
            }
        }

        async function loadFullScan() {
            try {
                const r = await fetch(API + '/api/system/full-scan');
                const d = await r.json();
                if (!r.ok) throw new Error(d.error || 'Falha no full scan');
                fullScanCache = d;

                const totals = d.totals || {};
                const summary = [
                    `Servidores: ${totals.servers_total || 0} (down: ${totals.servers_down || 0})`,
                    `Microserviços: ${totals.microservices_total || 0} (down: ${totals.microservices_down || 0})`,
                    `Páginas: ${totals.pages_total || 0} (down: ${totals.pages_down || 0})`,
                    `Funcionalidades: ${totals.functions_total || 0} (down: ${totals.functions_down || 0})`,
                ].join(' | ');
                document.getElementById('fullScanSummary').textContent = summary;
                applyFullScanFilters();
            } catch (e) {
                showToast('Erro ao executar varredura total: ' + e.message, 'error');
            }
        }

        async function triggerAnalysis() {
            const input = document.getElementById('logInput');
            const log = input.value.trim();
            if (!log) { showToast('Cole um log para analisar', 'error'); return; }
            const btn = document.querySelector('.btn-primary');
            const spinner = document.getElementById('triggerSpinner');
            btn.disabled = true;
            spinner.classList.remove('hidden');
            try {
                const r = await fetch(API + '/trigger', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ log })
                });
                const data = await r.json();
                if (r.ok) {
                    showToast('Análise iniciada: ' + data.thread_id);
                    input.value = '';
                    loadStatus();
                } else {
                    showToast(data.error || 'Erro ao disparar', 'error');
                }
            } catch (e) {
                showToast('Erro de conexão: ' + e.message, 'error');
            }
            btn.disabled = false;
            spinner.classList.add('hidden');
        }

        async function loadStatus() {
            try {
                const r = await fetch(API + '/api/status');
                const data = await r.json();
                const container = document.getElementById('threadsContainer');
                const threads = data.threads || [];
                if (threads.length === 0) {
                    container.innerHTML = '<div class="empty">Nenhuma análise ativa</div>';
                } else {
                    container.innerHTML = threads.map(t => {
                        const res = t.result || {};
                        const cls = t.status === 'aguardando_aprovacao' ? 'pending' : (t.status === 'erro' ? 'error' : (t.status === 'executando' ? 'pending' : 'completed'));
                        let actions = '';
                        if (t.status === 'aguardando_aprovacao') {
                            actions = `<div style="margin-top: 0.75rem;">
                                <button class="btn btn-success" onclick="approve('${t.thread_id}')">✓ Aprovar</button>
                                <button class="btn btn-danger" onclick="reject('${t.thread_id}')">✗ Rejeitar</button>
                            </div>`;
                        }
                        return `<div class="thread-item ${cls}">
                            <strong>${t.thread_id}</strong> — ${t.status}
                            <div class="meta">${t.updated_at || t.created_at || ''}</div>
                            ${res.diagnosis ? `<p style="margin-top: 0.5rem; font-size: 0.9rem;">${escapeHtml(res.diagnosis.substring(0, 200))}...</p>` : ''}
                            ${res.proposed_solution ? `<p style="margin-top: 0.25rem; font-size: 0.85rem; color: var(--text-dim);">Solução: ${escapeHtml(res.proposed_solution.substring(0, 150))}...</p>` : ''}
                            ${t.error ? `<p style="color: var(--error); margin-top: 0.5rem;">${escapeHtml(t.error)}</p>` : ''}
                            ${actions}
                        </div>`;
                    }).join('');
                }
            } catch (e) {
                document.getElementById('threadsContainer').innerHTML = '<div class="empty">Erro ao carregar</div>';
            }
        }

        function escapeHtml(s) {
            const d = document.createElement('div');
            d.textContent = s;
            return d.innerHTML;
        }

        async function approve(tid) {
            try {
                const r = await fetch(API + '/approve/' + tid, { method: 'POST' });
                const d = await r.json();
                showToast('Aprovado: ' + (d.execution_output || d.status));
                loadStatus();
                loadHistory();
            } catch (e) { showToast('Erro: ' + e.message, 'error'); }
        }

        async function reject(tid) {
            try {
                await fetch(API + '/reject/' + tid, { method: 'POST' });
                showToast('Rejeitado');
                loadStatus();
                loadHistory();
            } catch (e) { showToast('Erro: ' + e.message, 'error'); }
        }

        async function loadHistory() {
            try {
                const r = await fetch(API + '/api/history?limit=50');
                const data = await r.json();
                const items = data.history || [];
                const container = document.getElementById('historyContainer');
                if (items.length === 0) {
                    container.innerHTML = '<div class="empty">Nenhum histórico ainda</div>';
                } else {
                    container.innerHTML = items.map(h => `
                        <div class="history-item">
                            <strong>${h.thread_id}</strong> — ${h.status}
                            <div class="meta">${h.timestamp}</div>
                            ${h.raw_log_preview ? `<pre style="margin-top: 0.5rem; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(h.raw_log_preview)}</pre>` : ''}
                            ${h.diagnosis ? `<p style="margin-top: 0.25rem;">${escapeHtml(h.diagnosis)}</p>` : ''}
                            ${h.error ? `<p style="color: var(--error);">${escapeHtml(h.error)}</p>` : ''}
                        </div>
                    `).join('');
                }
            } catch (e) {
                document.getElementById('historyContainer').innerHTML = '<div class="empty">Erro ao carregar histórico</div>';
            }
        }

        async function loadLogFiles() {
            try {
                const r = await fetch(API + '/api/logs');
                const data = await r.json();
                const sel = document.getElementById('logFileSelect');
                const files = data.files || [];
                sel.innerHTML = '<option value="">-- Selecione um arquivo --</option>' +
                    files.map(f => `<option value="${f.index}">${escapeHtml(f.name)} (${(f.size/1024).toFixed(1)} KB)</option>`).join('');
            } catch (e) { showToast('Erro ao listar logs', 'error'); }
        }

        async function loadLogFile() {
            const idx = document.getElementById('logFileSelect').value;
            if (idx === '') {
                document.getElementById('logViewer').innerHTML = '<span class="empty">Selecione um arquivo</span>';
                return;
            }
            try {
                const r = await fetch(API + '/api/logs?index=' + idx + '&lines=200');
                const data = await r.json();
                if (data.error) {
                    document.getElementById('logViewer').innerHTML = '<span class="empty">' + escapeHtml(data.error) + '</span>';
                    return;
                }
                const lines = (data.content || '').split(String.fromCharCode(10));
                const html = lines.map(l => {
                    const lower = l.toLowerCase();
                    let cls = '';
                    if (lower.includes('error') || lower.includes('exception')) cls = 'line-error';
                    else if (lower.includes('warn')) cls = 'line-warn';
                    else if (lower.includes('info')) cls = 'line-info';
                    return '<div class="' + cls + '">' + escapeHtml(l) + '</div>';
                }).join('');
                document.getElementById('logViewer').innerHTML = html || '<span class="empty">Arquivo vazio</span>';
            } catch (e) {
                document.getElementById('logViewer').innerHTML = '<span class="empty">Erro ao carregar</span>';
            }
        }

        // Arrastar arquivo no textarea
        document.getElementById('logInput').addEventListener('dragover', e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)'; });
        document.getElementById('logInput').addEventListener('dragleave', e => { e.currentTarget.style.borderColor = ''; });
        document.getElementById('logInput').addEventListener('drop', e => {
            e.preventDefault();
            e.currentTarget.style.borderColor = '';
            const f = e.dataTransfer.files[0];
            if (f && f.name.endsWith('.log')) {
                const r = new FileReader();
                r.onload = () => { e.currentTarget.value = r.result; };
                r.readAsText(f);
            }
        });

        // Abas
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
                if (tab.dataset.tab === 'collector') {
                    loadCollectorStatus();
                    fetch(API + '/api/collector/status').then(r => r.json()).then(st => {
                        if (st.running && !collectorInterval) collectorInterval = setInterval(loadCollectorStatus, 3000);
                    }).catch(() => {});
                }
            });
        });

        // Coletor Automático
        async function collectorStart() {
            try {
                const r = await fetch(API + '/api/collector/start', { method: 'POST' });
                const d = await r.json();
                if (r.ok) {
                    showToast('Coletor iniciado');
                    document.getElementById('collectorStartBtn').classList.add('hidden');
                    document.getElementById('collectorStopBtn').classList.remove('hidden');
                    document.getElementById('collectorStatus').textContent = 'Status: Monitorando arquivos de log...';
                    loadCollectorStatus();
                    collectorInterval = setInterval(loadCollectorStatus, 3000);
                } else showToast(d.message || 'Erro', 'error');
            } catch (e) { showToast('Erro: ' + e.message, 'error'); }
        }
        async function collectorStop() {
            try {
                await fetch(API + '/api/collector/stop', { method: 'POST' });
                showToast('Coletor parado');
                document.getElementById('collectorStartBtn').classList.remove('hidden');
                document.getElementById('collectorStopBtn').classList.add('hidden');
                document.getElementById('collectorStatus').textContent = 'Status: Parado.';
                if (collectorInterval) clearInterval(collectorInterval);
            } catch (e) { showToast('Erro: ' + e.message, 'error'); }
        }
        let collectorInterval = null;
        async function loadCollectorStatus() {
            try {
                const r = await fetch(API + '/api/collector/status');
                const d = await r.json();
                const running = d.running || false;
                document.getElementById('collectorStartBtn').classList.toggle('hidden', running);
                document.getElementById('collectorStopBtn').classList.toggle('hidden', !running);
                document.getElementById('collectorStatus').textContent = running ? 'Status: Monitorando arquivos de log...' : 'Status: Parado.';
                document.getElementById('collectorCount').textContent = d.errors_count + ' erro(s) detectado(s)';
                const container = document.getElementById('collectorErrors');
                const errors = d.errors || [];
                window.collectorErrors = errors;
                if (errors.length === 0) {
                    container.innerHTML = '<div class="empty">Nenhum erro detectado ainda</div>';
                } else {
                    container.innerHTML = errors.map((e, i) => `
                        <div class="collector-item">
                            <div>
                                <div class="meta">${escapeHtml(e.timestamp)} | ${escapeHtml(e.file)}</div>
                                <div class="line">${escapeHtml(e.line)}</div>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="triggerFromCollector(${i})">Analisar</button>
                        </div>
                    `).join('');
                }
            } catch (e) { document.getElementById('collectorErrors').innerHTML = '<div class="empty">Erro ao carregar</div>'; }
        }
        async function triggerFromCollector(idx) {
            const line = (window.collectorErrors || [])[idx]?.line || '';
            if (!line) return;
            try {
                const r = await fetch(API + '/trigger', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ log: line })
                });
                const d = await r.json();
                if (r.ok) {
                    showToast('Análise iniciada: ' + d.thread_id);
                    loadStatus();
                    document.querySelector('[data-tab="dashboard"]').click();
                } else showToast(d.error || 'Erro', 'error');
            } catch (e) { showToast('Erro: ' + e.message, 'error'); }
        }

        // Ativar aba conforme pathname (/monitor-total, /diagnostico, /logs, /collector, /history)
        const pathTab = (path) => {
            const m = path.replace(/^\\//, '').toLowerCase();
            if (['central', 'monitor-total', 'monitor', 'diagnostico', 'logs', 'collector', 'history'].includes(m)) return m === 'monitor' ? 'monitor-total' : m;
            return 'dashboard';
        };
        const tab = pathTab(window.location.pathname);
        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        document.querySelectorAll('.tab-panel').forEach(p => {
            p.classList.toggle('active', p.id === 'tab-' + tab);
        });

        // Inicialização
        (async () => {
            await checkHealth();
            loadDiagnosticPresetOptions();
            loadDiagnosticFiltersFromStorage();
            loadStatus();
            loadHistory();
            loadLogFiles();
            loadSystemHealth();
            loadMaintenanceHistory();
            loadFullScan();
            loadDiagnosticReport();
            loadAutoAnalysisQueue();
            if (tab === 'collector') loadCollectorStatus();
            setInterval(checkHealth, 30000);
            setInterval(loadStatus, 10000);
            setInterval(loadSystemHealth, 15000);
            setInterval(loadMaintenanceHistory, 15000);
            setInterval(loadFullScan, 30000);
            setInterval(loadDiagnosticReport, 45000);
            setInterval(loadAutoAnalysisQueue, 10000);
        })();
    </script>
</body>
</html>"""


if __name__ == "__main__":
    run_server()
