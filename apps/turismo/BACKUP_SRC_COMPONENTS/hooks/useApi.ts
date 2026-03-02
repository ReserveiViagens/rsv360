import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ApiResponse, ApiError } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

export interface UseApiOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  onFinally?: () => void;
  showToast?: boolean;
  toastMessage?: string;
  errorToastMessage?: string;
  autoExecute?: boolean;
  dependencies?: any[];
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: ApiError | null) => void;
  setLoading: (loading: boolean) => void;
  refetch: () => Promise<T | null>;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  const {
    initialData = null,
    onSuccess,
    onError,
    onFinally,
    showToast = true,
    toastMessage = 'Operação realizada com sucesso!',
    errorToastMessage,
    autoExecute = false,
    dependencies = [],
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRetryCount = useRef(0);

  // Função para executar a API
  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Criar novo controller para esta requisição
      abortControllerRef.current = new AbortController();

      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      try {
        const response = await apiFunction(...args);

        if (response.success && response.data !== undefined) {
          setState(prev => ({
            ...prev,
            data: response.data,
            loading: false,
            success: true,
          }));

          // Callback de sucesso
          if (onSuccess) {
            onSuccess(response.data);
          }

          // Toast de sucesso
          if (showToast && toastMessage) {
            toast.success(toastMessage);
          }

          return response.data;
        } else {
          throw new Error(response.message || 'Operação falhou');
        }
      } catch (error: any) {
        // Verificar se foi cancelado
        if (error.name === 'AbortError') {
          return null;
        }

        const apiError: ApiError = {
          message: error.message || 'Erro desconhecido',
          status: error.status || 500,
          code: error.code,
          details: error.details || error,
        };

        setState(prev => ({
          ...prev,
          error: apiError,
          loading: false,
          success: false,
        }));

        // Callback de erro
        if (onError) {
          onError(apiError);
        }

        // Toast de erro
        if (showToast) {
          const message = errorToastMessage || apiError.message;
          toast.error(message);
        }

        // Retry automático se configurado
        if (currentRetryCount.current < retryCount && !isClientError(apiError.status)) {
          currentRetryCount.current++;
          
          retryTimeoutRef.current = setTimeout(() => {
            execute(...args);
          }, retryDelay * Math.pow(2, currentRetryCount.current - 1));
        }

        throw apiError;
      } finally {
        // Callback finally
        if (onFinally) {
          onFinally();
        }
      }
    },
    [apiFunction, onSuccess, onError, onFinally, showToast, toastMessage, errorToastMessage, retryCount, retryDelay]
  );

  // Função para resetar o estado
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
    currentRetryCount.current = 0;
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, [initialData]);

  // Função para definir dados manualmente
  const setData = useCallback((data: T) => {
    setState(prev => ({
      ...prev,
      data,
      success: true,
    }));
  }, []);

  // Função para definir erro manualmente
  const setError = useCallback((error: ApiError | null) => {
    setState(prev => ({
      ...prev,
      error,
      success: false,
    }));
  }, []);

  // Função para definir loading manualmente
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading,
    }));
  }, []);

  // Função para refazer a requisição
  const refetch = useCallback(async (): Promise<T | null> => {
    if (state.data) {
      // Se temos dados, tentar refazer com os mesmos parâmetros
      // Para isso, precisamos armazenar os últimos parâmetros usados
      return execute();
    }
    return null;
  }, [execute, state.data]);

  // Execução automática se configurada
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
  }, [autoExecute, execute, ...dependencies]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
    setLoading,
    refetch,
  };
}

// Hook para operações de CRUD
export function useCrudApi<T = any>(
  apiService: {
    get: (id: string) => Promise<ApiResponse<T>>;
    create: (data: any) => Promise<ApiResponse<T>>;
    update: (id: string, data: any) => Promise<ApiResponse<T>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
    list: (params?: any) => Promise<ApiResponse<{ data: T[]; pagination?: any }>>;
  },
  options: UseApiOptions<T> = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const listState = useApi(apiService.list, {
    ...options,
    onSuccess: (response) => {
      if (response.data) {
        setItems(response.data);
      }
      if (response.pagination) {
        setPagination(response.pagination);
      }
    },
  });

  const getState = useApi(apiService.get, {
    ...options,
    onSuccess: (data) => {
      setSelectedItem(data);
    },
  });

  const createState = useApi(apiService.create, {
    ...options,
    onSuccess: (data) => {
      setItems(prev => [data, ...prev]);
      setSelectedItem(data);
    },
  });

  const updateState = useApi(apiService.update, {
    ...options,
    onSuccess: (data) => {
      setItems(prev => prev.map(item => 
        // Assumindo que o item tem um id
        (item as any).id === (data as any).id ? data : item
      ));
      setSelectedItem(data);
    },
  });

  const deleteState = useApi(apiService.delete, {
    ...options,
    onSuccess: (_, id: string) => {
      setItems(prev => prev.filter(item => 
        (item as any).id !== id
      ));
      if (selectedItem && (selectedItem as any).id === id) {
        setSelectedItem(null);
      }
    },
  });

  const getItem = useCallback(async (id: string) => {
    return getState.execute(id);
  }, [getState]);

  const createItem = useCallback(async (data: any) => {
    return createState.execute(data);
  }, [createState]);

  const updateItem = useCallback(async (id: string, data: any) => {
    return updateState.execute(id, data);
  }, [updateState]);

  const deleteItem = useCallback(async (id: string) => {
    return deleteState.execute(id);
  }, [deleteState]);

  const listItems = useCallback(async (params?: any) => {
    return listState.execute(params);
  }, [listState]);

  const refreshList = useCallback(async () => {
    return listState.refetch();
  }, [listState]);

  return {
    // Estado dos itens
    items,
    pagination,
    selectedItem,
    
    // Estados das operações
    listState,
    getState,
    createState,
    updateState,
    deleteState,
    
    // Funções
    getItem,
    createItem,
    updateItem,
    deleteItem,
    listItems,
    refreshList,
    
    // Utilitários
    setItems,
    setSelectedItem,
    setPagination,
  };
}

// Hook para operações de lista com paginação
export function usePaginatedApi<T = any>(
  apiFunction: (params: any) => Promise<ApiResponse<{ data: T[]; pagination: any }>>,
  options: UseApiOptions<{ data: T[]; pagination: any }> = {}
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<any>({});

  const apiState = useApi(apiFunction, {
    ...options,
    dependencies: [page, pageSize, filters],
  });

  const loadPage = useCallback(async (newPage: number, newPageSize?: number, newFilters?: any) => {
    if (newPageSize !== undefined) {
      setPageSize(newPageSize);
    }
    if (newFilters !== undefined) {
      setFilters(newFilters);
    }
    setPage(newPage);
    
    const params = {
      page: newPage,
      limit: newPageSize || pageSize,
      ...(newFilters || filters),
    };
    
    return apiState.execute(params);
  }, [apiState, pageSize, filters]);

  const nextPage = useCallback(() => {
    if (apiState.data?.pagination && page < apiState.data.pagination.totalPages) {
      loadPage(page + 1);
    }
  }, [loadPage, page, apiState.data?.pagination]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      loadPage(page - 1);
    }
  }, [loadPage, page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && apiState.data?.pagination && newPage <= apiState.data.pagination.totalPages) {
      loadPage(newPage);
    }
  }, [loadPage, apiState.data?.pagination]);

  const applyFilters = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira página
    loadPage(1, pageSize, newFilters);
  }, [loadPage, pageSize]);

  const changePageSize = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1); // Reset para primeira página
    loadPage(1, newPageSize, filters);
  }, [loadPage, filters]);

  return {
    // Estado da paginação
    page,
    pageSize,
    filters,
    
    // Estado da API
    ...apiState,
    
    // Funções de paginação
    loadPage,
    nextPage,
    prevPage,
    goToPage,
    applyFilters,
    changePageSize,
    
    // Utilitários
    setPage,
    setPageSize,
    setFilters,
    
    // Dados da paginação
    pagination: apiState.data?.pagination,
    totalPages: apiState.data?.pagination?.totalPages || 0,
    totalItems: apiState.data?.pagination?.total || 0,
    hasNextPage: apiState.data?.pagination ? page < apiState.data.pagination.totalPages : false,
    hasPrevPage: page > 1,
  };
}

// Função utilitária para verificar se é erro do cliente
function isClientError(status: number): boolean {
  return status >= 400 && status < 500;
}

export default useApi;
