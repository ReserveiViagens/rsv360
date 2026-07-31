"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [totpCode, setTotpCode] = useState("")
  const [tempToken, setTempToken] = useState<string | null>(null)
  const from = searchParams?.get("from") || "/admin/cms"

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/session", {
          method: "GET",
          credentials: "include",
        })
        if (response.ok) {
          router.replace(from)
        }
      } catch {
        // sessão ausente/inválida: mantém na tela de login
      }
    }

    checkSession()
  }, [from, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedPassword = password.trim()
    if (!normalizedEmail || !normalizedPassword) {
      setError("Informe e-mail e senha.")
      return
    }

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: normalizedEmail,
          password: normalizedPassword,
        }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.success) {
        setError(result?.error || "Credenciais inválidas")
        return
      }

      if (result?.data?.requires_mfa_enrollment && result?.data?.enrollment_token) {
        router.replace(
          `/admin/mfa-enroll?token=${encodeURIComponent(result.data.enrollment_token)}`,
        )
        return
      }

      if (result?.data?.requires_2fa && result?.data?.temp_token) {
        setTempToken(result.data.temp_token)
        setError("")
        return
      }

      router.replace(from)
    } catch {
      setError("Não foi possível autenticar agora. Tente novamente.")
    }
  }

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    const normalizedCode = totpCode.trim()
    if (!tempToken || !normalizedCode) {
      setError("Informe o código do autenticador.")
      return
    }

    try {
      const response = await fetch("/api/admin/auth/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ temp_token: tempToken, code: normalizedCode }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.success) {
        setError(result?.error || "Código inválido")
        return
      }

      router.replace(from)
    } catch {
      setError("Não foi possível validar o TOTP agora. Tente novamente.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Acesso Admin</h1>
        <p className="text-sm text-gray-600 mb-6">Entre para gerenciar o conteúdo do site.</p>
        {!tempToken ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                inputMode="email"
                aria-label="E-mail do administrador"
                placeholder="seu@email.com"
                className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                aria-label="Senha do administrador"
                placeholder="Digite a senha"
                className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                suppressHydrationWarning
              />
            </div>
            {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
              aria-label="Entrar no painel admin"
              title="Entrar"
            >
              Entrar
            </button>
            <p className="text-center text-sm text-gray-600">
              <a
                href="/recuperar-senha?from=/admin/login"
                className="text-blue-600 hover:underline"
              >
                Esqueci a senha
              </a>
            </p>
          </form>
        ) : (
          <form onSubmit={handleTotpSubmit} className="space-y-4">
            <p className="text-sm text-gray-600">
              Digite o código de 6 dígitos do seu app autenticador.
            </p>
            <div>
              <label htmlFor="totp" className="block text-sm font-medium text-gray-700">Código TOTP</label>
              <input
                id="totp"
                name="totp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="Código do autenticador"
                placeholder="000000"
                className="mt-1 w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                autoFocus
                suppressHydrationWarning
              />
            </div>
            {error && <div className="text-sm text-red-600" role="alert">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md"
              aria-label="Validar código TOTP"
              title="Validar"
            >
              Validar código
            </button>
            <button
              type="button"
              className="w-full border py-2 rounded-md text-sm text-gray-700"
              onClick={() => {
                setTempToken(null)
                setTotpCode("")
                setError("")
              }}
            >
              Voltar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
