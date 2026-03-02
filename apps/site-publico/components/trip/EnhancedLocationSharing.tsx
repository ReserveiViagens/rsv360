/**
 * ✅ TAREFA MEDIUM-6: Componente melhorado de compartilhamento de localização
 * UI aprimorada com controles de privacidade, precisão e mapa integrado
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Users, Navigation, Wifi, WifiOff, Map, Shield, Settings, AlertCircle, CheckCircle2, Loader2 } from '@/lib/lucide-icons';
import { realtimeLocationService, RealtimeLocationService, type SharedLocation } from '@/lib/realtime-location-service';
import { toast } from 'sonner';

interface EnhancedLocationSharingProps {
  groupId: string;
  tripId?: number;
  wishlistId?: number;
  userId: number;
  userName?: string;
  showMap?: boolean;
}

export function EnhancedLocationSharing({
  groupId,
  tripId,
  wishlistId,
  userId,
  userName,
  showMap = true,
}: EnhancedLocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [locations, setLocations] = useState<SharedLocation[]>([]);
  const [myLocation, setMyLocation] = useState<SharedLocation | null>(null);
  const [updateInterval, setUpdateInterval] = useState(30);
  const [privacyLevel, setPrivacyLevel] = useState<'public' | 'friends' | 'private'>('friends');
  const [autoStopAfter, setAutoStopAfter] = useState<number | null>(null);
  const [minAccuracy, setMinAccuracy] = useState(50);
  const [currentAccuracy, setCurrentAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadPrivacySettings();
    connect();

    return () => {
      disconnect();
    };
  }, [groupId, userId]);

  const loadPrivacySettings = async () => {
    try {
      const response = await fetch(
        `/api/location/privacy?user_id=${userId}&group_id=${groupId}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrivacyLevel(data.data.privacy_level || 'friends');
          setAutoStopAfter(data.data.auto_stop_after);
          setMinAccuracy(data.data.min_accuracy || 50);
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar configurações de privacidade:', error);
    }
  };

  const savePrivacySettings = async () => {
    try {
      await fetch('/api/location/privacy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          group_id: groupId,
          privacy_level: privacyLevel,
          auto_stop_after: autoStopAfter,
          min_accuracy: minAccuracy,
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const connect = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('Token não encontrado');
        return;
      }

      await realtimeLocationService.connect(groupId, token);
      setIsConnected(true);

      unsubscribeRef.current = realtimeLocationService.subscribe(
        groupId,
        (updatedLocations: SharedLocation[]) => {
          setLocations(updatedLocations);
          const myLoc = updatedLocations.find(loc => loc.userId === userId);
          if (myLoc) {
            setMyLocation(myLoc);
            setCurrentAccuracy(myLoc.accuracy || null);
          }
        }
      );

      const initialLocations = await realtimeLocationService.loadGroupLocations(
        groupId,
        tripId,
        wishlistId
      );
      setLocations(initialLocations);

      const myLoc = initialLocations.find(loc => loc.userId === userId);
      if (myLoc) {
        setMyLocation(myLoc);
        setCurrentAccuracy(myLoc.accuracy || null);
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
      setLoading(true);
      if (!navigator.geolocation) {
        toast.error('Geolocalização não suportada pelo navegador');
        return;
      }

      await savePrivacySettings();

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
      toast.success('Compartilhamento iniciado!', {
        icon: <CheckCircle2 className="w-4 h-4" />,
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar compartilhamento');
    } finally {
      setLoading(false);
    }
  };

  const stopSharing = async () => {
    try {
      realtimeLocationService.stopSharing();
      await realtimeLocationService.stopUserSharing(userId, tripId, wishlistId);
      
      setIsSharing(false);
      setMyLocation(null);
      setCurrentAccuracy(null);
      
      toast.success('Compartilhamento parado');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao parar compartilhamento');
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

  const privacyLabels = {
    public: { label: 'Público', description: 'Todos podem ver sua localização', color: 'bg-blue-100 text-blue-700' },
    friends: { label: 'Amigos', description: 'Apenas membros do grupo', color: 'bg-green-100 text-green-700' },
    private: { label: 'Privado', description: 'Localização ofuscada (~100m)', color: 'bg-yellow-100 text-yellow-700' },
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
        {/* Controles principais */}
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
              disabled={!isConnected || loading}
            />
          </div>

          {isSharing && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              {/* Intervalo de atualização */}
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
                  <Label>Nível de Privacidade</Label>
                </div>
                <Select
                  value={privacyLevel}
                  onValueChange={(value: 'public' | 'friends' | 'private') => {
                    setPrivacyLevel(value);
                    savePrivacySettings();
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
                <p className="text-xs text-muted-foreground">
                  {privacyLabels[privacyLevel].description}
                </p>
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
                    setMinAccuracy(parseInt(e.target.value));
                    savePrivacySettings();
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
                    savePrivacySettings();
                  }}
                  placeholder="Desabilitado"
                />
                <p className="text-xs text-muted-foreground">
                  {autoStopAfter ? `Parará automaticamente após ${autoStopAfter} minutos` : 'Não para automaticamente'}
                </p>
              </div>

              {/* Indicador de precisão atual */}
              {currentAccuracy !== null && (
                <Alert className={
                  currentAccuracy <= minAccuracy
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
                }>
                  <AlertCircle className={`w-4 h-4 ${
                    currentAccuracy <= minAccuracy ? 'text-green-600' : 'text-yellow-600'
                  }`} />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <span className={
                        currentAccuracy <= minAccuracy ? 'text-green-700' : 'text-yellow-700'
                      }>
                        Precisão atual: ±{Math.round(currentAccuracy)}m
                      </span>
                      {currentAccuracy <= minAccuracy ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    {currentAccuracy > minAccuracy && (
                      <p className="text-xs mt-1 text-yellow-700">
                        Abaixo do mínimo configurado ({minAccuracy}m)
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Minha localização */}
          {myLocation && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="font-medium">Sua localização</span>
                <Badge className={privacyLabels[privacyLevel].color}>
                  {privacyLabels[privacyLevel].label}
                </Badge>
              </div>
              {myLocation.address ? (
                <p className="text-sm">{myLocation.address}</p>
              ) : (
                <p className="text-sm">
                  {myLocation.latitude.toFixed(6)}, {myLocation.longitude.toFixed(6)}
                </p>
              )}
              {myLocation.accuracy && (
                <p className="text-xs text-muted-foreground mt-1">
                  Precisão: ±{Math.round(myLocation.accuracy)}m
                  {myLocation.accuracy <= minAccuracy && (
                    <span className="text-green-600 ml-1">✓</span>
                  )}
                </p>
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
                  ? RealtimeLocationService.calculateDistance(
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
                        <div className="flex items-center gap-2 flex-wrap">
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
                          {location.accuracy && (
                            <span>
                              ±{Math.round(location.accuracy)}m
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

        {locations.length === 0 && !isSharing && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma localização compartilhada ainda</p>
            <p className="text-sm mt-1">
              Ative o compartilhamento para começar
            </p>
          </div>
        )}

        {!isConnected && (
          <Alert>
            <WifiOff className="w-4 h-4" />
            <AlertDescription>
              Modo offline. Reconectando automaticamente...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}


