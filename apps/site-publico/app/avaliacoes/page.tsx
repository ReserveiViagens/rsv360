'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewsList } from '@/components/reviews-list';
import { ReviewForm } from '@/components/review-form';
import { getUser } from '@/lib/auth';
import { MessageSquare, Star, User } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

export default function AvaliacoesPage() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('received');
  const toast = useToast();

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Avaliações</h1>
        <p className="text-muted-foreground">
          Gerencie suas avaliações recebidas e enviadas
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="received">
            <Star className="w-4 h-4 mr-2" />
            Recebidas
          </TabsTrigger>
          <TabsTrigger value="sent">
            <MessageSquare className="w-4 h-4 mr-2" />
            Enviadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Recebidas</CardTitle>
              <CardDescription>
                Avaliações que você recebeu como anfitrião
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <ReviewsList hostId={user.id} />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Faça login para ver suas avaliações recebidas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avaliações Enviadas</CardTitle>
              <CardDescription>
                Avaliações que você enviou para outros anfitriões
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <ReviewsList userId={user.id} />
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Faça login para ver suas avaliações enviadas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

