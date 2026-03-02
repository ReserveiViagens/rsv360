"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, RefreshCw, Upload, Shield, Database } from "lucide-react";
import { useWebsiteData } from "@/hooks/useWebsiteData";
import HotelManagement from "@/components/admin/HotelManagement";
import PromotionManagement from "@/components/admin/PromotionManagement";
import AttractionManagement from "@/components/admin/AttractionManagement";
import { motion } from "framer-motion";

export default function CMSDashboard() {
  const {
    hotels,
    promotions,
    attractions,
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
  } = useWebsiteData();

  const [activeTab, setActiveTab] = useState("hotels");

  const handleRefresh = async () => {
    await loadAllData();
  };

  // Estatísticas
  const stats = {
    totalHotels: hotels.length,
    activeHotels: hotels.filter(h => h.status === 'active').length,
    totalPromotions: promotions.length,
    activePromotions: promotions.filter(p => p.status === 'active').length,
    totalAttractions: attractions.length,
    activeAttractions: attractions.filter(a => (a as any).status === 'active' || (a as any).is_active).length,
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
              Dashboard CMS
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
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
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
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Erro ao carregar dados</span>
                </div>
                <p className="text-red-600 text-sm mt-1">{error}</p>
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
                <div className="border-b">
                  <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
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
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="hotels" className="mt-0">
                    <HotelManagement
                      hotels={hotels}
                      onCreate={createHotel}
                      onUpdate={updateHotel}
                      onDelete={deleteHotel}
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
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
