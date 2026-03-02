# Correções de Imagens e PWA - Site Público

## ✅ Correções Aplicadas

### 1. Configuração de Imagens do Next.js (`next.config.js`)

**Problema:** Erro `Invalid src prop (...) hostname "hebbkx1anhila5yf.public.blob.vercel-storage.com" is not configured`

**Solução:** Migrado de `domains` (deprecated) para `remotePatterns` com suporte a:
- ✅ Vercel Blob Storage específico: `hebbkx1anhila5yf.public.blob.vercel-storage.com`
- ✅ Qualquer subdomínio do Vercel Blob: `*.public.blob.vercel-storage.com`
- ✅ Localhost (desenvolvimento)
- ✅ reserveiviagens.com.br (produção)

**Arquivo modificado:** `apps/site-publico/next.config.js`

### 2. Arquivos PWA Criados

#### 2.1. `offline.html`
- ✅ Página offline criada em `apps/site-publico/public/offline.html`
- ✅ Design responsivo e moderno
- ✅ Recarrega automaticamente quando a conexão é restaurada

#### 2.2. Ícones PWA
- ✅ Pasta `apps/site-publico/public/icons/` criada
- ✅ `icon-192x192.png` criado (a partir do favicon do Vercel Blob)
- ✅ `icon-512x512.png` criado (a partir do favicon do Vercel Blob)
- ✅ `favicon-original.png` baixado do Vercel Blob

**Nota:** Os ícones foram criados copiando o favicon original. Para redimensionar corretamente, instale ImageMagick:
```powershell
choco install imagemagick
# ou baixe de: https://imagemagick.org/script/download.php
```

Depois, execute novamente:
```powershell
.\apps\site-publico\scripts\download-favicon-and-create-icons.ps1
```

## 🔄 Próximos Passos

### 1. Reiniciar o Servidor Next.js

**IMPORTANTE:** O Next.js só lê `next.config.js` na inicialização. Você precisa reiniciar o servidor:

1. **Parar o servidor atual:**
   - Na janela do PowerShell onde o `site-publico` está rodando, pressione `Ctrl + C`

2. **Reiniciar o servidor:**
   ```powershell
   cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
   npm run dev --workspace=apps/site-publico
   ```

3. **Verificar se a configuração foi carregada:**
   - O servidor deve iniciar sem erros
   - Acesse: http://localhost:3000
   - Verifique se as imagens do Vercel Blob carregam sem erros no console

### 2. Testar as Correções

Após reiniciar, teste:

- ✅ **Imagens do Vercel Blob:** Acesse http://localhost:3000 e verifique se o favicon no header carrega sem erros
- ✅ **PWA Offline:** Desconecte a internet e acesse uma página - deve mostrar `offline.html`
- ✅ **Ícones PWA:** Verifique se `/icons/icon-192x192.png` e `/icons/icon-512x512.png` retornam 200 (não mais 404)

### 3. Verificar no Console do Navegador

Abra o DevTools (F12) e verifique:
- ❌ **Antes:** `Invalid src prop (...) hostname "hebbkx1anhila5yf.public.blob.vercel-storage.com" is not configured`
- ✅ **Depois:** Sem erros relacionados a imagens

## 📝 Scripts Criados

1. **`apps/site-publico/scripts/create-pwa-icons.ps1`**
   - Cria ícones SVG e placeholders PNG

2. **`apps/site-publico/scripts/download-favicon-and-create-icons.ps1`**
   - Baixa o favicon do Vercel Blob
   - Cria os ícones PNG necessários (requer ImageMagick para redimensionar)

## 🎯 Status Final

- ✅ `next.config.js` atualizado com `remotePatterns`
- ✅ `offline.html` criado
- ✅ Ícones PWA criados (192x192 e 512x512)
- ⏳ **Aguardando:** Reinicialização do servidor Next.js para aplicar mudanças

## 🔍 Verificação Rápida

Execute este comando para verificar se os arquivos foram criados:

```powershell
cd "D:\Backup rsv36-servidor-oficial 22_11_2025as_08_36\RSV360 Versao Oficial"
Get-ChildItem "apps\site-publico\public\icons" | Select-Object Name, Length
Get-ChildItem "apps\site-publico\public\offline.html" | Select-Object Name
```

Todos os arquivos devem estar presentes!

