import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Database, Cloud, Download } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../stores/useUIStore';

export interface OfflineSupportProps {
  children: React.ReactNode;
  className?: string;
  enableOfflineMode?: boolean;
  cacheExpiry?: number; // em milissegundos
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt: number;
}

const OfflineSupport: React.FC<OfflineSupportProps> = ({
  children,
  className,
  enableOfflineMode = true,
  cacheExpiry = 24 * 60 * 60 * 1000 // 24 horas
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [cachedData, setCachedData] = useState<CachedData[]>([]);
  const [pendingActions, setPendingActions] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const { showNotification } = useUIStore();

  // Detectar mudanças na conectividade
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotification('Conexão restaurada!', 'success');
      handleSyncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotification('Conexão perdida - Modo offline ativado', 'warning');
      if (enableOfflineMode) {
        setIsOfflineMode(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enableOfflineMode, showNotification]);

  // Carregar dados em cache do localStorage
  useEffect(() => {
    if (enableOfflineMode) {
      loadCachedData();
      loadPendingActions();
    }
  }, [enableOfflineMode]);

  // Limpar dados expirados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      cleanupExpiredData();
    }, 60000); // A cada minuto

    return () => clearInterval(interval);
  }, []);

  // Carregar dados em cache
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem('rsv_offline_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setCachedData(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar cache offline:', error);
    }
  };

  // Salvar dados em cache
  const saveCachedData = useCallback((key: string, data: any) => {
    if (!enableOfflineMode) return;

    const newCachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + cacheExpiry
    };

    const updatedCache = [...cachedData.filter(item => item.key !== key), newCachedData];
    setCachedData(updatedCache);

    try {
      localStorage.setItem('rsv_offline_cache', JSON.stringify(updatedCache));
    } catch (error) {
      console.error('Erro ao salvar cache offline:', error);
    }
  }, [enableOfflineMode, cachedData, cacheExpiry]);

  // Carregar ações pendentes
  const loadPendingActions = () => {
    try {
      const pending = localStorage.getItem('rsv_pending_actions');
      if (pending) {
        setPendingActions(JSON.parse(pending));
      }
    } catch (error) {
      console.error('Erro ao carregar ações pendentes:', error);
    }
  };

  // Salvar ações pendentes
  const savePendingActions = useCallback((actions: any[]) => {
    try {
      localStorage.setItem('rsv_pending_actions', JSON.stringify(actions));
    } catch (error) {
      console.error('Erro ao salvar ações pendentes:', error);
    }
  }, []);

  // Adicionar ação pendente
  const addPendingAction = useCallback((action: any) => {
    if (!enableOfflineMode || isOnline) return;

    const newPendingActions = [...pendingActions, { ...action, timestamp: Date.now() }];
    setPendingActions(newPendingActions);
    savePendingActions(newPendingActions);
    showNotification('Ação salva para sincronização posterior', 'info');
  }, [enableOfflineMode, isOnline, pendingActions, savePendingActions, showNotification]);

  // Limpar dados expirados
  const cleanupExpiredData = () => {
    const now = Date.now();
    const validData = cachedData.filter(item => item.expiresAt > now);
    
    if (validData.length !== cachedData.length) {
      setCachedData(validData);
      try {
        localStorage.setItem('rsv_offline_cache', JSON.stringify(validData));
      } catch (error) {
        console.error('Erro ao limpar cache expirado:', error);
      }
    }
  };

  // Sincronizar ações pendentes
  const handleSyncPendingActions = useCallback(async () => {
    if (pendingActions.length === 0 || !isOnline) return;

    setSyncStatus('syncing');
    showNotification('Sincronizando ações pendentes...', 'info');

    try {
      // Simular sincronização com o servidor
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Aqui você implementaria a sincronização real com sua API
      const successCount = pendingActions.length;
      setPendingActions([]);
      savePendingActions([]);
      
      setSyncStatus('success');
      showNotification(`${successCount} ações sincronizadas com sucesso!`, 'success');

      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('error');
      showNotification('Erro na sincronização', 'error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, [pendingActions, isOnline, savePendingActions, showNotification]);

  // Obter dados do cache
  const getCachedData = useCallback((key: string) => {
    const cached = cachedData.find(item => item.key === key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    return null;
  }, [cachedData]);

  // Verificar se dados estão em cache
  const hasCachedData = useCallback((key: string) => {
    const cached = cachedData.find(item => item.key === key);
    return cached && cached.expiresAt > Date.now();
  }, [cachedData]);

  // Estatísticas do cache
  const cacheStats = {
    totalItems: cachedData.length,
    validItems: cachedData.filter(item => item.expiresAt > Date.now()).length,
    pendingActions: pendingActions.length,
    cacheSize: new Blob([JSON.stringify(cachedData)]).size
  };

  // Renderizar indicador de status
  const renderStatusIndicator = () => {
    if (!enableOfflineMode) return null;

    return (
      <div className="fixed top-4 right-4 z-50">
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300",
          isOnline 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-orange-100 text-orange-800 border border-orange-200"
        )}>
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Offline</span>
            </>
          )}
        </div>
      </div>
    );
  };

  // Renderizar painel de cache (apenas em desenvolvimento)
  const renderCachePanel = () => {
    if (!enableOfflineMode || process.env.NODE_ENV !== 'development') return null;

    return (
      <div className="fixed bottom-4 left-4 z-50">
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium">Cache Offline</span>
          </div>
          <div className="text-xs space-y-1">
            <div>Itens: {cacheStats.validItems}/{cacheStats.totalItems}</div>
            <div>Pendentes: {cacheStats.pendingActions}</div>
            <div>Tamanho: {(cacheStats.cacheSize / 1024).toFixed(1)}KB</div>
          </div>
          {pendingActions.length > 0 && isOnline && (
            <button
              onClick={handleSyncPendingActions}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Sincronizar
            </button>
          )}
        </div>
      </div>
    );
  };

  // Renderizar indicador de sincronização
  const renderSyncIndicator = () => {
    if (syncStatus === 'idle') return null;

    const statusConfig = {
      syncing: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100', text: 'Sincronizando...' },
      success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', text: 'Sincronizado!' },
      error: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', text: 'Erro na sincronização' }
    };

    const config = statusConfig[syncStatus];
    const IconComponent = config.icon;

    return (
      <div className="fixed top-20 right-4 z-50">
        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg", config.bg)}>
          <IconComponent className={cn("w-4 h-4", config.color)} />
          <span className={cn("text-sm font-medium", config.color)}>{config.text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('offline-support', className)}>
      {children}
      
      {renderStatusIndicator()}
      {renderSyncIndicator()}
      {renderCachePanel()}

      {/* Context Provider para funcionalidades offline */}
      <OfflineContext.Provider value={{
        isOnline,
        isOfflineMode,
        enableOfflineMode,
        saveCachedData,
        getCachedData,
        hasCachedData,
        addPendingAction,
        pendingActions,
        cacheStats
      }}>
        {children}
      </OfflineContext.Provider>
    </div>
  );
};

// Context para funcionalidades offline
export const OfflineContext = React.createContext({
  isOnline: true,
  isOfflineMode: false,
  enableOfflineMode: true,
  saveCachedData: (key: string, data: any) => {},
  getCachedData: (key: string) => null,
  hasCachedData: (key: string) => false,
  addPendingAction: (action: any) => {},
  pendingActions: [] as any[],
  cacheStats: {
    totalItems: 0,
    validItems: 0,
    pendingActions: 0,
    cacheSize: 0
  }
});

export { OfflineSupport };
export type { OfflineSupportProps };
