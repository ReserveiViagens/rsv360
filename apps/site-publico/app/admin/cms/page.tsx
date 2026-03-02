"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Upload, Shield, Database, User, LogOut } from "@/lib/lucide-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useWebsiteData } from "@/hooks/useWebsiteData";
import { useActivityLog } from "@/hooks/useActivityLog";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import HotelManagement from "@/components/admin/HotelManagement";
import PromotionManagement from "@/components/admin/PromotionManagement";
import AttractionManagement from "@/components/admin/AttractionManagement";
import TicketManagement from "@/components/admin/TicketManagement";
import HeaderManagement from "@/components/admin/HeaderManagement";
import SiteManagement from "@/components/admin/SiteManagement";
import AuctionManagement from "@/components/admin/AuctionManagement";
import FlashDealManagement from "@/components/admin/FlashDealManagement";
import OTAManagement from "@/components/admin/OTAManagement";
import GoogleHotelAdsManagement from "@/components/admin/GoogleHotelAdsManagement";
import SideRailsManagement from "@/components/admin/SideRailsManagement";
import { motion } from "framer-motion";

export default function CMSDashboard() {
  const router = useRouter();
  const { addLog } = useActivityLog();
  const {
    hotels,
    promotions,
    attractions,
    tickets,
    settings,
    loading,
    error,
    loadAllData,
    createHotel,
    updateHotel,
    deleteHotel,
    createPromotion,
    updatePromotion,
    deletePromotion,
    createAttraction,
    updateAttraction,
    deleteAttraction,
    createTicket,
    updateTicket,
    deleteTicket,
  } = useWebsiteData();

  const [activeTab, setActiveTab] = useState("hotels");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleRefresh = async () => {
    await loadAllData();
    addLog("refresh", "dashboard", { details: "Dados atualizados manualmente" });
  };

  const handleLogout = () => {
    addLog("logout", "auth", { details: "Usuário fez logout" });
    logout();
  };

  // Estatísticas
  const stats = {
    totalHotels: hotels.length,
    activeHotels: hotels.filter(h => h.status === 'active').length,
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === 'active').length,
    totalAttractions: attractions.length,
    activeAttractions: attractions.filter(a => a.status === 'active').length,
    totalTickets: tickets.length,
    activeTickets: tickets.filter(t => t.is_active || t.status === 'active').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Painel de Conteúdo (CMS)
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie hotéis, promoções e atrações do site
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
              suppressHydrationWarning
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                addLog("navigate", "profile", { details: "Navegação para página de perfil" });
                router.push("/admin/profile");
              }}
              className="flex items-center gap-2"
              suppressHydrationWarning
              title="Acessar perfil e histórico de atividades"
            >
              <User className="w-4 h-4" />
              Perfil
            </Button>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configurações
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações do CMS</DialogTitle>
                  <DialogDescription>Parâmetros gerais e informações do site.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>API:</span><span className="font-mono">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}</span></div>
                  <div className="flex justify-between"><span>Items:</span><span>Hotéis {hotels.length} · Promoções {promotions.length} · Atrações {attractions.length}</span></div>
                  <div className="pt-2 border-t" />
                  <div className="grid gap-2">
                    <a href="/admin/uploads" className="text-left text-sm px-2 py-1 rounded border bg-white hover:bg-gray-50">Gerenciar Uploads</a>
                    <a href="/admin/logs" className="text-left text-sm px-2 py-1 rounded border bg-white hover:bg-gray-50">Logs Estruturados</a>
                    <a href="/admin/health" className="text-left text-sm px-2 py-1 rounded border bg-white hover:bg-gray-50">Monitoramento de Health</a>
                    <a href="/admin/profile" className="text-left text-sm px-2 py-1 rounded border bg-white hover:bg-gray-50">Perfil e Atividades</a>
                  </div>
                  <div className="text-muted-foreground">Mais opções em breve.</div>
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="flex items-center gap-2"
              suppressHydrationWarning
              title="Fazer logout e sair do sistema"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Hotéis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalHotels}</div>
              <p className="text-xs text-green-600">
                {stats.activeHotels} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Promoções
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPromotions}</div>
              <p className="text-xs text-green-600">
                {stats.activePromotions} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Atrações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAttractions}</div>
              <p className="text-xs text-green-600">
                {stats.activeAttractions} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingressos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-green-600">
                {stats.activeTickets} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                <Upload className="w-3 h-3 inline mr-1" />
                Imagens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-xs text-green-600">
                <Shield className="w-3 h-3 inline mr-1" />
                Ativo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Banco de Dados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">✓</div>
              <p className="text-xs text-green-600">
                <Database className="w-3 h-3 inline mr-1" />
                Conectado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Leilões
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">
                <span className="text-lg">🔨</span>
                Gerenciar
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Erro ao carregar dados</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                {error.includes('Backend não está rodando') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-xs font-medium mb-1">💡 Como resolver:</p>
                    <ol className="text-yellow-700 text-xs list-decimal list-inside space-y-1">
                      <li>Abra um terminal na pasta <code className="bg-yellow-100 px-1 rounded">backend</code></li>
                      <li>Execute: <code className="bg-yellow-100 px-1 rounded">node test-admin-server.js</code></li>
                      <li>Aguarde a mensagem: "Servidor Admin APIs rodando na porta 5002"</li>
                      <li>Clique em "Atualizar" acima para recarregar os dados</li>
                    </ol>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b overflow-x-auto">
                  <TabsList className="flex w-max min-w-full flex-nowrap gap-0 bg-transparent h-auto p-0 [&>button]:shrink-0">
                    <TabsTrigger
                      value="hotels"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      <span className="text-lg">🏨</span>
                      Hotéis ({stats.totalHotels})
                    </TabsTrigger>
                    <TabsTrigger
                      value="promotions"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600"
                    >
                      <span className="text-lg">🎯</span>
                      Promoções ({stats.totalPromotions})
                    </TabsTrigger>
                    <TabsTrigger
                      value="attractions"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-600 data-[state=active]:border-b-2 data-[state=active]:border-purple-600"
                    >
                      <span className="text-lg">📍</span>
                      Atrações ({stats.totalAttractions})
                    </TabsTrigger>
                    <TabsTrigger
                      value="tickets"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-600 data-[state=active]:border-b-2 data-[state=active]:border-yellow-600"
                    >
                      <span className="text-lg">🎟️</span>
                      Ingressos ({stats.totalTickets})
                    </TabsTrigger>
                    <TabsTrigger
                      value="side-rails"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-teal-50 data-[state=active]:text-teal-600 data-[state=active]:border-b-2 data-[state=active]:border-teal-600"
                    >
                      <span className="text-lg">📐</span>
                      Laterais
                    </TabsTrigger>
                    <TabsTrigger
                      value="header"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:border-b-2 data-[state=active]:border-red-600"
                    >
                      <span className="text-lg">🎬</span>
                      Header
                    </TabsTrigger>
                    <TabsTrigger
                      value="site"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 data-[state=active]:border-b-2 data-[state=active]:border-indigo-600"
                    >
                      <span className="text-lg">🌐</span>
                      Site
                    </TabsTrigger>
                    <TabsTrigger
                      value="auctions"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600"
                    >
                      <span className="text-lg">🔨</span>
                      Leilões
                    </TabsTrigger>
                    <TabsTrigger
                      value="flash-deals"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-600 data-[state=active]:border-b-2 data-[state=active]:border-yellow-600"
                    >
                      <span className="text-lg">⚡</span>
                      Flash Deals
                    </TabsTrigger>
                    <TabsTrigger
                      value="ota"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                    >
                      <span className="text-lg">🌐</span>
                      OTA
                    </TabsTrigger>
                    <TabsTrigger
                      value="google-hotel-ads"
                      className="flex items-center gap-2 py-4 px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:border-b-2 data-[state=active]:border-green-600"
                    >
                      <span className="text-lg">🏨</span>
                      Google Hotel Ads
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="hotels" className="mt-0">
                    <HotelManagement
                      hotels={hotels}
                      onCreate={createHotel}
                      onUpdate={updateHotel}
                      onDelete={deleteHotel}
                      onRefresh={loadAllData}
                      loading={loading}
                    />
                  </TabsContent>

                  <TabsContent value="promotions" className="mt-0">
                    <PromotionManagement
                      promotions={promotions}
                      onCreate={createPromotion}
                      onUpdate={updatePromotion}
                      onDelete={deletePromotion}
                      loading={loading}
                    />
                  </TabsContent>

                  <TabsContent value="attractions" className="mt-0">
                    <AttractionManagement
                      attractions={attractions}
                      onCreate={createAttraction}
                      onUpdate={updateAttraction}
                      onDelete={deleteAttraction}
                      loading={loading}
                    />
                  </TabsContent>

                  <TabsContent value="tickets" className="mt-0">
                    <TicketManagement
                      tickets={tickets}
                      onCreate={createTicket}
                      onUpdate={updateTicket}
                      onDelete={deleteTicket}
                      loading={loading}
                    />
                  </TabsContent>

                  <TabsContent value="side-rails" className="mt-0">
                    <SideRailsManagement />
                  </TabsContent>

                  <TabsContent value="header" className="mt-0">
                    <HeaderManagement />
                  </TabsContent>

                  <TabsContent value="site" className="mt-0">
                    <SiteManagement />
                  </TabsContent>

                  <TabsContent value="auctions" className="mt-0">
                    <AuctionManagement />
                  </TabsContent>

                  <TabsContent value="flash-deals" className="mt-0">
                    <FlashDealManagement />
                  </TabsContent>

                  <TabsContent value="ota" className="mt-0">
                    <OTAManagement />
                  </TabsContent>

                  <TabsContent value="google-hotel-ads" className="mt-0">
                    <GoogleHotelAdsManagement />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
