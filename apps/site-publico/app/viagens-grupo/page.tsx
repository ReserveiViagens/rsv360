/**
 * ✅ PÁGINA: DASHBOARD DE VIAGENS EM GRUPO
 * Dashboard completo integrando todas as funcionalidades de viagens em grupo
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import dynamic from 'next/dynamic';

// Importações dinâmicas para evitar problemas de webpack
// Nova abordagem: retornar named export diretamente sem wrapper { default: ... }
const WishlistManager = dynamic(
  () => import('@/components/wishlist/WishlistManager').then((mod) => mod.WishlistManager),
  { ssr: false, loading: () => <div className="p-4">Carregando listas de desejos...</div> }
);
const SplitPaymentManager = dynamic(
  () => import('@/components/split-payment/SplitPaymentManager').then((mod) => mod.SplitPaymentManager),
  { ssr: false, loading: () => <div className="p-4">Carregando divisão de pagamento...</div> }
);
const TripInvitationManager = dynamic(
  () => import('@/components/trip-invitation/TripInvitationManager').then((mod) => mod.TripInvitationManager),
  { ssr: false, loading: () => <div className="p-4">Carregando convites...</div> }
);
const EnhancedGroupChatUI = dynamic(
  () => import('@/components/enhanced-group-chat-ui').then((mod) => mod.EnhancedGroupChatUI),
  { ssr: false, loading: () => <div className="p-4">Carregando chat...</div> }
);
import { Heart, DollarSign, Mail, MessageSquare } from '@/lib/lucide-icons';

function ViagensGrupoContent() {
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState<number | undefined>();
  const [wishlistId, setWishlistId] = useState<number | undefined>();
  const [groupChatId, setGroupChatId] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState('wishlists');

  useEffect(() => {
    const bookingIdParam = searchParams?.get('booking_id');
    const wishlistIdParam = searchParams?.get('wishlist_id');
    const groupChatIdParam = searchParams?.get('group_chat_id');
    
    setBookingId(bookingIdParam ? parseInt(bookingIdParam) : undefined);
    setWishlistId(wishlistIdParam ? parseInt(wishlistIdParam) : undefined);
    setGroupChatId(groupChatIdParam ? parseInt(groupChatIdParam) : undefined);
    
    // Auto-selecionar tab baseado nos params
    if (bookingIdParam) setActiveTab('split-payment');
    if (wishlistIdParam) setActiveTab('wishlists');
    if (groupChatIdParam) setActiveTab('chat');
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Viagens em Grupo</h1>
        <p className="text-muted-foreground text-lg">
          Gerencie listas de desejos, divisão de pagamentos, convites e chats para suas viagens em grupo
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="wishlists" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Listas de Desejos
          </TabsTrigger>
          <TabsTrigger value="split-payment" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Divisão de Pagamento
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Convites
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat em Grupo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wishlists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listas de Desejos Compartilhadas</CardTitle>
              <CardDescription>
                Organize e compartilhe listas de desejos para suas viagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WishlistManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="split-payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Divisão de Pagamentos</CardTitle>
              <CardDescription>
                Divida o pagamento de reservas entre os participantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingId ? (
                <SplitPaymentManager bookingId={bookingId} />
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Selecione uma reserva para gerenciar a divisão de pagamento
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Convites de Viagem</CardTitle>
              <CardDescription>
                Envie convites para participar de reservas, wishlists e viagens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TripInvitationManager bookingId={bookingId} wishlistId={wishlistId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chat em Grupo</CardTitle>
              <CardDescription>
                Converse com os participantes da sua viagem em grupo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {groupChatId ? (
                <EnhancedGroupChatUI 
                  groupChatId={groupChatId}
                  userId={undefined}
                  userEmail={undefined}
                />
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Selecione um grupo de chat para começar a conversar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ViagensGrupoPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Carregando...</div>}>
      <ViagensGrupoContent />
    </Suspense>
  );
}

