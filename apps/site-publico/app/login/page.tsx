"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, Shield, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import Image from "next/image"
import { login, register, setToken } from "@/lib/auth"
import { FormField, Validators } from "@/components/form-with-validation"
import { formatPhone, formatCPFCNPJ } from "@/lib/validations"
import { useToast } from "@/components/providers/toast-wrapper"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("login")
  const toast = useToast()

  const redirectTo = searchParams?.get('redirect') || '/minhas-reservas'

  useEffect(() => {
    const token = searchParams?.get('token')
    if (token && typeof window !== 'undefined') {
      setToken(token)
      router.push(redirectTo)
    }
  }, [searchParams, router, redirectTo])

  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab === 'register') setActiveTab('register')
  }, [searchParams])

  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerPhone, setRegisterPhone] = useState("")
  const [registerDocument, setRegisterDocument] = useState("")

  const [rateLimitBlocked, setRateLimitBlocked] = useState(false)

  const handleResetRateLimit = async () => {
    try {
      const res = await fetch('/api/auth/reset-rate-limit', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setError('')
        setRateLimitBlocked(false)
        toast.success('Bloqueio removido. Tente fazer login novamente.')
      }
    } catch {
      toast.error('Não foi possível desbloquear.')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setRateLimitBlocked(false)
    setIsLoading(true)
    try {
      await login(loginEmail, loginPassword)
      toast.success('Login realizado com sucesso!')
      router.push(redirectTo)
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao fazer login"
      setError(errorMsg)
      toast.error(errorMsg)
      if (errorMsg.includes('Muitas tentativas')) {
        setRateLimitBlocked(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError("")
    setIsLoading(true)
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ''
      window.location.href = `${API_BASE_URL}/api/auth/${provider}?redirect=${encodeURIComponent(redirectTo)}`
    } catch (err: any) {
      setError(`Erro ao conectar com ${provider === 'google' ? 'Google' : 'Facebook'}`)
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (registerPassword.length < 6) {
      const errorMsg = "Senha deve ter pelo menos 6 caracteres"
      setError(errorMsg)
      toast.warning(errorMsg)
      return
    }
    setIsLoading(true)
    try {
      await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        phone: registerPhone || undefined,
        document: registerDocument || undefined,
      })
      toast.success('Cadastro realizado com sucesso!')
      router.push(redirectTo)
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao fazer cadastro"
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Painel esquerdo - Branding (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 xl:p-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-between max-w-xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Reservei Viagens"
              width={48}
              height={48}
              className="rounded-xl bg-white/10 p-1.5"
            />
            <span className="text-xl font-bold">Reservei Viagens</span>
          </Link>
          <div className="space-y-8 mt-16">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
                Sua próxima viagem
                <br />
                <span className="text-blue-200">começa aqui</span>
              </h1>
              <p className="mt-4 text-lg text-blue-100/90 max-w-md">
                Acesse suas reservas, gerencie seu perfil e descubra as melhores ofertas em hotéis e parques.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: Shield, text: "Pagamento 100% seguro" },
                { icon: Sparkles, text: "Ofertas exclusivas" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-white/90">
                  <div className="p-2 rounded-lg bg-white/10">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm text-blue-200/70 mt-8">
            © {new Date().getFullYear()} Reservei Viagens. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Painel direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16 bg-gray-50/50 dark:bg-gray-900/50">
        {/* Header mobile */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <span className="text-2xl">←</span>
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-lg"
            />
            <span className="font-semibold">Reservei Viagens</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Bem-vindo de volta
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Entre na sua conta ou crie uma nova
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setError(""); }}>
              <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl mb-6">
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm">
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-600 data-[state=active]:shadow-sm">
                  Cadastrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-5">
                  {error && (
                    <div className="space-y-2">
                      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                        {error}
                      </div>
                      {rateLimitBlocked && process.env.NODE_ENV === 'development' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleResetRateLimit}
                          className="w-full text-amber-700 border-amber-300 hover:bg-amber-50"
                        >
                          Desbloquear tentativas (apenas desenvolvimento)
                        </Button>
                      )}
                    </div>
                  )}

                  <FormField
                    label="E-mail"
                    name="loginEmail"
                    type="email"
                    value={loginEmail}
                    onChange={setLoginEmail}
                    placeholder="seu@email.com"
                    required
                    validator={Validators.email}
                  />

                  <div className="space-y-2">
                    <Label htmlFor="loginPassword">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="loginPassword"
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-11 pr-11 h-11 rounded-xl"
                        placeholder="Sua senha"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <Link href="/recuperar-senha" className="text-sm text-blue-600 hover:text-blue-700 hover:underline block mt-1">
                      Esqueceu a senha?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-base font-medium" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Entrando...
                      </span>
                    ) : (
                      "Entrar"
                    )}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-gray-800 px-3 text-xs text-gray-500 uppercase tracking-wider">ou continue com</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="h-11 rounded-xl border-2" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="h-11 rounded-xl border-2" onClick={() => handleSocialLogin('facebook')} disabled={isLoading}>
                      <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                      {error}
                    </div>
                  )}

                  <FormField label="Nome Completo" name="registerName" value={registerName} onChange={setRegisterName} placeholder="Seu nome" required
                    validator={(v) => !v.trim() ? { valid: false, message: "Obrigatório" } : v.trim().length < 3 ? { valid: false, message: "Mín. 3 caracteres" } : { valid: true }} />

                  <FormField label="E-mail" name="registerEmail" type="email" value={registerEmail} onChange={setRegisterEmail} placeholder="seu@email.com" required validator={Validators.email} />

                  <FormField label="Telefone" name="registerPhone" type="tel" value={registerPhone} onChange={(v) => setRegisterPhone(formatPhone(v))} placeholder="(00) 00000-0000"
                    validator={(v) => !v ? { valid: true } : Validators.phone(v)} />

                  <FormField label="CPF" name="registerDocument" value={registerDocument} onChange={(v) => setRegisterDocument(formatCPFCNPJ(v))} placeholder="000.000.000-00"
                    validator={(v) => !v ? { valid: true } : Validators.cpf(v)} />

                  <div className="space-y-2">
                    <Label htmlFor="registerPassword">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input id="registerPassword" type={showPassword ? "text" : "password"} value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)}
                        className="pl-11 pr-11 h-11 rounded-xl" placeholder="Mínimo 6 caracteres" required minLength={6} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-base font-medium" disabled={isLoading}>
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Cadastrando...
                      </span>
                    ) : (
                      "Criar conta"
                    )}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-600" /></div>
                    <div className="relative flex justify-center"><span className="bg-white dark:bg-gray-800 px-3 text-xs text-gray-500 uppercase tracking-wider">ou cadastre-se com</span></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" className="h-11 rounded-xl border-2" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    <Button type="button" variant="outline" className="h-11 rounded-xl border-2" onClick={() => handleSocialLogin('facebook')} disabled={isLoading}>
                      <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <Link href="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link>
            {' '}e{' '}
            <Link href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
