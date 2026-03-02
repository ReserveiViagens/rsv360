/**
 * Componente de Compartilhamento de Localização em Tempo Real
 * Permite que membros de um grupo compartilhem suas localizações
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapPin, Users, Navigation, Wifi, WifiOff, Share2, Map, Shield, Settings, AlertCircle } from '@/lib/lucide-icons';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { realtimeLocationService, type SharedLocation } from '@/lib/realtime-location-service';
import { useToast } from '@/components/providers/toast-wrapper';

interface RealtimeLocationSharingProps {
  groupId: string;
  tripId?: number;
  wishlistId?: number;
  userId: number;
  userName?: string;
  showMap?: boolean;
}

export function RealtimeLocationSharing({
  groupId,
  tripId,
  wishlistId,
  userId,
  userName,
  showMap = true,
}: RealtimeLocationSharingProps) {
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [locations, setLocations] = useState<SharedLocation[]>([]);
  const [myLocation, setMyLocation] = useState<SharedLocation | null>(null);
  const [updateInterval, setUpdateInterval] = useState(30); // segundos
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('friends');
  const [autoStopAfter, setAutoStopAfter] = useState<number | null>(null); // minutos
  const [minAccuracy, setMinAccuracy] = useState(50); // metros
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [groupId]);

  const connect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      await realtimeLocationService.connect(groupId, token);
      setIsConnected(true);

      // Subscrever a atualizações
      unsubscribeRef.current = realtimeLocationService.subscribe(
        groupId,
        (updatedLocations: SharedLocation[]) => {
          setLocations(updatedLocations);
          
          // Encontrar minha localização
          const myLoc = updatedLocations.find(loc => loc.userId === userId);
          if (myLoc) {
            setMyLocation(myLoc);
          }
        }
      );

      // Carregar localizações iniciais
      const initialLocations = await realtimeLocationService.loadGroupLocations(
        groupId,
        tripId,
        wishlistId
      );
      setLocations(initialLocations);

      const myLoc = initialLocations.find(loc => loc.userId === userId);
      if (myLoc) {
        setMyLocation(myLoc);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    if (isSharing) {
      stopSharing();
    }

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    realtimeLocationService.disconnect();
    setIsConnected(false);
  };

  const startSharing = async () => {
    try {
      if (!navigator.geolocation) {
        toast({
          title: 'Erro',
          description: 'Geolocalização não suportada pelo navegador',
          variant: 'destructive',
        });
        return;
      }

      // Carregar configurações de privacidade
      try {
        const privacyResponse = await fetch(
          `/api/location/privacy?user_id=${userId}&group_id=${groupId}`
        );
        if (privacyResponse.ok) {
          const privacyData = await privacyResponse.json();
          if (privacyData.success) {
            setPrivacyLevel(privacyData.data.privacy_level || 'friends');
            setAutoStopAfter(privacyData.data.auto_stop_after);
            setMinAccuracy(privacyData.data.min_accuracy || 50);
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar configurações de privacidade:', error);
      }

      await realtimeLocationService.startSharing(
        groupId,
        userId,
        userName,
        {
          tripId,
          wishlistId,
          updateInterval,
          privacyLevel,
          autoStopAfter: autoStopAfter ? autoStopAfter : undefined,
          minAccuracy,
        }
      );

      setIsSharing(true);
      toast({
        title: 'Compartilhamento iniciado',
        description: 'Sua localização está sendo compartilhada em tempo real',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao iniciar compartilhamento',
        variant: 'destructive',
      });
    }
  };

  const stopSharing = async () => {
    try {
      realtimeLocationService.stopSharing();
      await realtimeLocationService.stopUserSharing(userId, tripId, wishlistId);
      
      setIsSharing(false);
      setMyLocation(null);
      
      toast({
        title: 'Compartilhamento parado',
        description: 'Sua localização não está mais sendo compartilhada',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao parar compartilhamento',
        variant: 'destructive',
      });
    }
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'agora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atrás`;
    return `${Math.floor(seconds / 3600)}h atrás`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Compartilhamento de Localização
            </CardTitle>
            <CardDescription>
              Veja onde estão os membros do grupo em tempo real
            </CardDescription>
          </div>
          {isConnected ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Wifi className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <WifiOff className="w-3 h-3 mr-1" />
              Desconectado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sharing-toggle">Compartilhar minha localização</Label>
              <p className="text-sm text-muted-foreground">
                {isSharing ? 'Sua localização está sendo compartilhada' : 'Ative para compartilhar'}
              </p>
            </div>
            <Switch
              id="sharing-toggle"
              checked={isSharing}
              onCheckedChange={(checked) => {
                if (checked) {
                  startSharing();
                } else {
                  stopSharing();
                }
              }}
              disabled={!isConnected}
            />
          </div>

          {isSharing && (
            <div className="space-y-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <Label htmlFor="update-interval">Intervalo de atualização</Label>
                <div className="flex items-center gap-2">
                  <input
                    id="update-interval"
                    type="range"
                    min="10"
                    max="120"
                    step="10"
                    value={updateInterval}
                    onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium w-16">{updateInterval}s</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Atualiza a cada {updateInterval} segundos
                </p>
              </div>

              {/* Configurações de Privacidade */}
              <div className="space-y-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4" />
                  <Label>Privacidade</Label>
                </div>
                <Select
                  value={privacyLevel}
                  onValueChange={(value: 'public' | 'friends' | 'private') => {
                    setPrivacyLevel(value);
                    // Salvar configuração
                    fetch('/api/location/privacy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: userId,
                        group_id: groupId,
                        privacy_level: value,
                        auto_stop_after: autoStopAfter,
                        min_accuracy: minAccuracy,
                      }),
                    }).catch(console.error);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Público (todos podem ver)</SelectItem>
                    <SelectItem value="friends">Apenas amigos do grupo</SelectItem>
                    <SelectItem value="private">Privado (ofuscado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Precisão mínima */}
              <div className="space-y-2">
                <Label htmlFor="min-accuracy">Precisão mínima (metros)</Label>
                <Input
                  id="min-accuracy"
                  type="number"
                  min="10"
                  max="500"
                  value={minAccuracy}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setMinAccuracy(val);
                    fetch('/api/location/privacy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: userId,
                        group_id: groupId,
                        privacy_level: privacyLevel,
                        auto_stop_after: autoStopAfter,
                        min_accuracy: val,
                      }),
                    }).catch(console.error);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Ignora atualizações com precisão pior que {minAccuracy}m
                </p>
              </div>

              {/* Parada automática */}
              <div className="space-y-2">
                <Label htmlFor="auto-stop">Parar automaticamente após (minutos)</Label>
                <Input
                  id="auto-stop"
                  type="number"
                  min="0"
                  max="480"
                  value={autoStopAfter || ''}
                  onChange={(e) => {
                    const val = e.target.value ? parseInt(e.target.value) : null;
                    setAutoStopAfter(val);
                    fetch('/api/location/privacy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: userId,
                        group_id: groupId,
                        privacy_level: privacyLevel,
                        auto_stop_after: val,
                        min_accuracy: minAccuracy,
                      }),
                    }).catch(console.error);
                  }}
                  placeholder="Desabilitado"
                />
                <p className="text-xs text-muted-foreground">
                  {autoStopAfter ? `Parará automaticamente após ${autoStopAfter} minutos` : 'Não para automaticamente'}
                </p>
              </div>

              {/* Indicador de precisão atual */}
              {currentAccuracy !== null && (
                <div className={`p-2 rounded text-xs ${
                  currentAccuracy <= minAccuracy
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>
                      Precisão atual: ±{Math.round(currentAccuracy)}m
                      {currentAccuracy > minAccuracy && ' (abaixo do mínimo)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Minha localização */}
          {myLocation && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="font-medium">Sua localização</span>
              </div>
              {myLocation.address ? (
                <p className="text-sm">{myLocation.address}</p>
              ) : (
                <p className="text-sm">
                  {myLocation.latitude.toFixed(6)}, {myLocation.longitude.toFixed(6)}
                </p>
              )}
              {myLocation.accuracy && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Precisão: ±{Math.round(myLocation.accuracy)}m
                    {myLocation.accuracy <= minAccuracy ? (
                      <span className="text-green-600 ml-1">✓</span>
                    ) : (
                      <span className="text-yellow-600 ml-1">⚠</span>
                    )}
                  </p>
                  {setCurrentAccuracy(myLocation.accuracy)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista de membros */}
        {locations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <h3 className="font-medium">
                Membros ({locations.length})
              </h3>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locations.map((location) => {
                const isMe = location.userId === userId;
                const distance = myLocation && !isMe
                  ? realtimeLocationService.calculateDistance(
                      myLocation.latitude,
                      myLocation.longitude,
                      location.latitude,
                      location.longitude
                    )
                  : null;

                return (
                  <div
                    key={location.userId}
                    className={`p-3 rounded-lg border ${
                      isMe
                        ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {location.userName || `Usuário ${location.userId}`}
                          </span>
                          {isMe && (
                            <Badge variant="outline" className="text-xs">
                              Você
                            </Badge>
                          )}
                          {location.isActive ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              <Wifi className="w-2 h-2 mr-1" />
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        {location.address ? (
                          <p className="text-sm text-muted-foreground mt-1">
                            {location.address}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{getTimeAgo(location.lastUpdate)}</span>
                          {distance !== null && (
                            <span className="font-medium">
                              {formatDistance(distance)} de distância
                            </span>
                          )}
                          {location.speed && location.speed > 0 && (
                            <span>
                              {Math.round(location.speed * 3.6)} km/h
                            </span>
                          )}
                        </div>
                      </div>
                      {showMap && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                              '_blank'
                            );
                          }}
                        >
                          <Map className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {locations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma localização compartilhada ainda</p>
            <p className="text-sm mt-1">
              Ative o compartilhamento para começar
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

