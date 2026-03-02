"""Agente Monitor: detecta erros, filtra logs e dispara o fluxo.

Responsabilidades:
- Filtrar linhas com Error, Exception, Critical, FATAL
- Limitar tamanho do contexto (ex: últimas 50 linhas relevantes)
- Passar log filtrado ao Analista para reduzir tokens
"""

# Lógica implementada em nodes/monitor_node.py
