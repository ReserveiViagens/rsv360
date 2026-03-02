# 🔐 GUIA DE LOGIN COM REDES SOCIAIS

## ✅ IMPLEMENTAÇÃO COMPLETA

### Funcionalidades Adicionadas

1. **Login/Registro Melhorado**
   - ✅ Página de login/registro com design moderno
   - ✅ Botões de login social (Google e Facebook)
   - ✅ Redirecionamento inteligente após login
   - ✅ Preenchimento automático de dados para usuários logados

2. **OAuth Google**
   - ✅ Endpoint: `/api/auth/google`
   - ✅ Callback: `/api/auth/google/callback`
   - ✅ Integração completa

3. **OAuth Facebook**
   - ✅ Endpoint: `/api/auth/facebook`
   - ✅ Callback: `/api/auth/facebook/callback`
   - ✅ Integração completa

4. **Finalização da Cotação**
   - ✅ Link para login na página de reserva
   - ✅ Preenchimento automático de dados do usuário logado
   - ✅ Melhor experiência do usuário

---

## 🔧 CONFIGURAÇÃO

### Variáveis de Ambiente

Adicione ao arquivo `.env.local`:

```env
# OAuth Google
GOOGLE_CLIENT_ID=seu_google_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_google_client_secret_aqui

# OAuth Facebook
FACEBOOK_APP_ID=seu_facebook_app_id_aqui
FACEBOOK_APP_SECRET=seu_facebook_app_secret_aqui

# JWT Secret (já deve estar configurado)
JWT_SECRET=sua_chave_secreta_aqui
```

---

## 📝 COMO OBTER CREDENCIAIS

### Google OAuth

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** > **Credentials**
4. Clique em **Create Credentials** > **OAuth client ID**
5. Configure:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
   - (Em produção: `https://seudominio.com/api/auth/google/callback`)
6. Copie o **Client ID** e **Client Secret**

### Facebook OAuth

1. Acesse: https://developers.facebook.com/
2. Crie um novo app ou selecione um existente
3. Vá em **Settings** > **Basic**
4. Adicione **Facebook Login** como produto
5. Configure:
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/facebook/callback`
   - (Em produção: `https://seudominio.com/api/auth/facebook/callback`)
6. Copie o **App ID** e **App Secret**

---

## 🚀 USO

### Para Usuários

1. **Acesse a página de login**: `/login`
2. **Escolha uma opção**:
   - Login tradicional (e-mail e senha)
   - Login com Google
   - Login com Facebook
3. **Após login**, você será redirecionado automaticamente

### Durante a Reserva

1. Na página de reserva (`/reservar/[id]`), se não estiver logado:
   - Aparecerá um card azul com opção de fazer login
   - Ao clicar em "Entrar", será redirecionado para login
   - Após login, voltará para a página de reserva
   - Os dados serão preenchidos automaticamente

---

## 🧪 TESTE EM DESENVOLVIMENTO

Sem credenciais configuradas, o sistema funciona em modo de desenvolvimento:
- Os botões de login social aparecem
- Ao clicar, mostra mensagem informando que precisa configurar
- O login tradicional continua funcionando normalmente

---

## 📊 FLUXO COMPLETO

### Login Tradicional
```
Usuário → /login → Preenche e-mail/senha → API valida → Token JWT → Redireciona
```

### Login Google
```
Usuário → /login → Clica "Continuar com Google" → Google OAuth → Callback → Token JWT → Redireciona
```

### Login Facebook
```
Usuário → /login → Clica "Continuar com Facebook" → Facebook OAuth → Callback → Token JWT → Redireciona
```

### Durante Reserva
```
Usuário → /reservar/[id] → Não logado → Card de login → /login?redirect=... → Login → Volta para reserva → Dados preenchidos
```

---

## ✨ PRONTO!

O sistema de login com redes sociais está completo e funcional! 🎉

