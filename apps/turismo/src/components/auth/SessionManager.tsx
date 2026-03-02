'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { 
  Clock, 
  Smartphone, 
  Monitor, 
  Globe, 
  Shield, 
  AlertTriangle,
  RefreshCw,
  LogOut,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import { cn } from '@/lib/utils';

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActivity: Date;
  isCurrent: boolean;
  isActive: boolean;
  userAgent: string;
  createdAt: Date;
}

interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  currentDevice: string;
  lastLogin: Date;
  suspiciousActivity: number;
}

export const SessionManager: React.FC = () => {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - em produção viria da API
  useEffect(() => {
    const mockSessions: Session[] = [
      {
        id: '1',
        device: 'Desktop - Windows 11',
        browser: 'Chrome 120.0.0',
        location: 'São Paulo, BR',
        ipAddress: '192.168.1.100',
        lastActivity: new Date(),
        isCurrent: true,
        isActive: true,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
      },
      {
        id: '2',
        device: 'Mobile - iPhone 15',
        browser: 'Safari 17.0',
        location: 'Rio de Janeiro, BR',
        ipAddress: '192.168.1.101',
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
        isCurrent: false,
        isActive: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 dia atrás
      },
      {
        id: '3',
        device: 'Laptop - MacBook Pro',
        browser: 'Firefox 121.0',
        location: 'Belo Horizonte, BR',
        ipAddress: '192.168.1.102',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        isCurrent: false,
        isActive: false,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 dias atrás
      }
    ];

    const mockStats: SessionStats = {
      totalSessions: 3,
      activeSessions: 2,
      currentDevice: 'Desktop - Windows 11',
      lastLogin: new Date(),
      suspiciousActivity: 0
    };

    setSessions(mockSessions);
    setStats(mockStats);
    setLoading(false);
  }, []);

  const refreshSessions = async () => {
    setRefreshing(true);
    // Simular refresh da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const terminateSession = async (sessionId: string) => {
    if (sessionId === '1') {
      alert('Não é possível encerrar a sessão atual');
      return;
    }
    
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const terminateAllOtherSessions = async () => {
    setSessions(prev => prev.filter(s => s.isCurrent));
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days} dias atrás`;
  };

  const getDeviceIcon = (device: string): React.ReactNode => {
    if (device.includes('Mobile') || device.includes('iPhone')) return <Smartphone className="h-4 w-4" />;
    if (device.includes('Laptop')) return <Monitor className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Gerenciador de Sessões
          </CardTitle>
          <CardDescription>
            Gerencie suas sessões ativas e monitore a segurança da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalSessions}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Total de Sessões</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats?.activeSessions}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Sessões Ativas</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats?.suspiciousActivity}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">Atividades Suspeitas</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
              >
                {showSensitiveInfo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showSensitiveInfo ? 'Ocultar' : 'Mostrar'} Info Sensível
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSessions}
                disabled={refreshing}
              >
                <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
                Atualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={terminateAllOtherSessions}
                className="text-orange-600 hover:text-orange-700"
              >
                <LogOut className="h-4 w-4" />
                Encerrar Outras
              </Button>
            </div>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Ativas ({sessions.filter(s => s.isActive).length})</TabsTrigger>
              <TabsTrigger value="recent">Recentes ({sessions.length})</TabsTrigger>
              <TabsTrigger value="suspicious">Suspeitas ({stats?.suspiciousActivity || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {sessions.filter(s => s.isActive).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onTerminate={terminateSession}
                  showSensitiveInfo={showSensitiveInfo}
                  formatTimeAgo={formatTimeAgo}
                  getDeviceIcon={getDeviceIcon}
                />
              ))}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onTerminate={terminateSession}
                  showSensitiveInfo={showSensitiveInfo}
                  formatTimeAgo={formatTimeAgo}
                  getDeviceIcon={getDeviceIcon}
                />
              ))}
            </TabsContent>

            <TabsContent value="suspicious" className="space-y-4">
              {stats?.suspiciousActivity === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhuma atividade suspeita detectada. Sua conta está segura!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Atividades suspeitas detectadas. Revise suas sessões ativas.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface SessionCardProps {
  session: Session;
  onTerminate: (sessionId: string) => void;
  showSensitiveInfo: boolean;
  formatTimeAgo: (date: Date) => string;
  getDeviceIcon: (device: string) => React.ReactNode;
}

const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onTerminate,
  showSensitiveInfo,
  formatTimeAgo,
  getDeviceIcon
}) => {
  return (
    <Card className={cn(
      "transition-all duration-200",
      session.isCurrent && "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20",
      !session.isActive && "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1">
              {getDeviceIcon(session.device)}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{session.device}</span>
                {session.isCurrent && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Sessão Atual
                  </Badge>
                )}
                {!session.isActive && (
                  <Badge variant="secondary">Inativa</Badge>
                )}
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  {session.location}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Última atividade: {formatTimeAgo(session.lastActivity)}
                </div>
                {showSensitiveInfo && (
                  <>
                    <div className="flex items-center gap-2">
                      <Monitor className="h-3 w-3" />
                      {session.browser}
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      IP: {session.ipAddress}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!session.isCurrent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTerminate(session.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Encerrar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionManager;
