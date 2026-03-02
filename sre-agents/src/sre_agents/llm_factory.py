"""Factory para criar instâncias de LLM (Ollama, OpenAI, Anthropic)."""

import os
from langchain_core.language_models import BaseChatModel

try:
    from langchain_ollama import ChatOllama
    HAS_OLLAMA = True
    OLLAMA_SOURCE = "langchain_ollama"
except ImportError:
    try:
        from langchain_community.chat_models import ChatOllama
        HAS_OLLAMA = True
        OLLAMA_SOURCE = "langchain_community"
    except ImportError:
        HAS_OLLAMA = False
        OLLAMA_SOURCE = None

try:
    from langchain_openai import ChatOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

try:
    from langchain_anthropic import ChatAnthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


def get_llm(temperature: float = 0.2) -> BaseChatModel:
    """
    Retorna o LLM configurado via variáveis de ambiente.
    Prioridade: LLM_PROVIDER -> ollama | openai | anthropic
    """
    provider = os.getenv("LLM_PROVIDER", "ollama").lower()

    if provider == "ollama" and HAS_OLLAMA:
        model = os.getenv("OLLAMA_MODEL", "llama3.1")
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        return ChatOllama(model=model, base_url=base_url, temperature=temperature)

    if provider == "openai" and HAS_OPENAI:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY não configurada para provider openai")
        model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        return ChatOpenAI(model=model, api_key=api_key, temperature=temperature)

    if provider == "anthropic" and HAS_ANTHROPIC:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY não configurada para provider anthropic")
        model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")
        return ChatAnthropic(model=model, api_key=api_key, temperature=temperature)

    if provider == "ollama":
        raise ValueError(
            "Ollama selecionado mas langchain-community não instalado. "
            "Execute: pip install langchain-community"
        )
    raise ValueError(
        f"Provider '{provider}' não suportado ou dependências faltando. "
        "Use: ollama, openai ou anthropic"
    )
