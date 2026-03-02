# Guia Rápido: Configurar Google Maps API Key

## Passo 1: Criar arquivo .env.local

No diretório `apps/site-publico/`, crie um arquivo chamado `.env.local` com o seguinte conteúdo:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key_aqui
```

**Comando PowerShell:**
```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\site-publico"
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua_api_key_aqui" > .env.local
```

## Passo 2: Obter API Key do Google Maps

1. Acesse https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. No menu lateral, vá em **APIs & Services** > **Library**
4. Procure por "Maps JavaScript API" e clique em **Enable**
5. Vá em **APIs & Services** > **Credentials**
6. Clique em **Create Credentials** > **API Key**
7. Copie a API key gerada
8. Clique na API key criada para editar e configure:
   - **Application restrictions**: HTTP referrers (web sites)
   - **Website restrictions**: Adicione `http://localhost:3000/*`

## Passo 3: Configurar a API Key

Edite o arquivo `.env.local` e substitua `sua_api_key_aqui` pela API key que você copiou:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...sua_key_real_aqui
```

## Passo 4: Reiniciar o servidor Next.js

Se o servidor Next.js já estiver rodando, pare-o (Ctrl+C) e reinicie:

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial\apps\site-publico"
npm run dev
```

Ou se estiver usando o script de inicialização completa:

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
.\Iniciar Sistema Completo.ps1
```

## Passo 5: Testar

1. Acesse http://localhost:3000/leiloes
2. Verifique se o mapa carrega corretamente
3. Verifique se os marcadores aparecem nas coordenadas corretas
4. Verifique se a Property Listing mostra os cards sincronizados

## Troubleshooting

### Mapa não carrega
- Verifique se o arquivo `.env.local` existe e está no diretório correto
- Verifique se a variável `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` está correta
- Reinicie o servidor Next.js após criar/editar o `.env.local`
- Verifique o console do navegador para erros relacionados ao Google Maps

### Erro "This API key is not authorized"
- Verifique se a API "Maps JavaScript API" está habilitada no Google Cloud Console
- Verifique se as restrições de HTTP referrer estão configuradas corretamente
- Certifique-se de que está acessando via `http://localhost:3000` (não `https://`)

### Marcadores não aparecem
- Verifique se os hotéis/leilões têm coordenadas válidas no banco de dados
- Verifique o console do navegador para erros JavaScript
- Verifique se os dados estão sendo retornados corretamente pela API

## Notas Importantes

- ⚠️ **Nunca commite o arquivo `.env.local` no git** - ele contém informações sensíveis
- 🔒 Para produção, use uma API key diferente com restrições de domínio específicas
- 📊 A API key de teste tem limites de requisições (geralmente $200 de crédito grátis por mês)
- 🔄 Se mudar a API key, sempre reinicie o servidor Next.js
