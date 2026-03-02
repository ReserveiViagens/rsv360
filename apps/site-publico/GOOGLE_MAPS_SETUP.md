# Google Maps API Key Configuration
# 
# Para configurar o Google Maps no projeto:
#
# 1. Crie um arquivo .env.local na raiz de apps/site-publico/
# 2. Adicione a seguinte linha:
#    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key_aqui
#
# 3. Para obter uma API Key:
#    - Acesse https://console.cloud.google.com/
#    - Crie um novo projeto ou selecione um existente
#    - Ative a API "Maps JavaScript API"
#    - Crie uma credencial (API Key)
#    - Configure restrições de HTTP referrer: http://localhost:3000/*
#
# IMPORTANTE: 
# - Nunca commite o arquivo .env.local no git
# - Para produção, use uma key diferente com restrições de domínio
# - A key de teste tem limites de requisições
