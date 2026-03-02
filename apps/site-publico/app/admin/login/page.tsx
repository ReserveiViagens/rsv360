"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const from = searchParams.get("from") || "/admin/cms"

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
    const normalizedPassword = password.trim()
    if (!normalizedPassword) {
      setError("Informe a senha.")
      return
    }

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: normalizedPassword }),
      })

      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.success) {
        setError(result?.error || "Credenciais inválidas")
        return
      }

      router.replace(from)
    } catch {
      setError("Não foi possível autenticar agora. Tente novamente.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-xl shadow p-6">
        <h1 className="text-xl font-semibold mb-4">Acesso Admin</h1>
        <p className="text-sm text-gray-600 mb-6">Entre para gerenciar o conteúdo do site.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            autoComplete="username"
            defaultValue="admin@rsv360.local"
            className="hidden"
            tabIndex={-1}
            aria-hidden="true"
          />
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
        </form>
      </div>
    </div>
  )
}
