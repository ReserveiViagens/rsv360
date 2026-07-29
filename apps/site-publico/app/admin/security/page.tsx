'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminSecurityPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('Confirmação de senha não confere.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          password_confirmation: confirmPassword,
          totp_code: totpCode.trim(),
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result?.success) {
        setError(result?.error || 'Não foi possível alterar a senha.')
        return
      }
      setSuccess(result?.message || 'Senha alterada. Faça login novamente.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTotpCode('')
      window.setTimeout(() => {
        router.replace('/admin/login')
      }, 1200)
    } catch {
      setError('Não foi possível alterar a senha agora.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Segurança da conta</h1>
        <p className="mt-1 text-sm text-slate-600">
          Altere a senha com a senha atual e o código do autenticador (TOTP). A sessão será
          encerrada após o sucesso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
        <div>
          <Label htmlFor="current-password">Senha atual</Label>
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="new-password">Nova senha</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirmar nova senha</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="totp">Código TOTP</Label>
          <Input
            id="totp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            placeholder="000000"
            value={totpCode}
            onChange={(e) => setTotpCode(e.target.value)}
            className="mt-1 tracking-widest"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-700" role="status">
            {success}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Salvando…' : 'Alterar senha'}
        </Button>
      </form>

      <p className="text-sm text-slate-600">
        Esqueceu a senha?{' '}
        <Link href="/recuperar-senha?from=/admin/login" className="text-blue-600 hover:underline">
          Recuperar acesso
        </Link>
      </p>
    </div>
  )
}
