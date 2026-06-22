import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ApiResponse, ApiError } from '@/lib/api-client';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  success: boolean;
}

export interface PaginationMeta {
  totalPages?: number;
  total?: number;
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
  dependencies?: unknown[];
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiReturn<T> extends UseApiState<T> {
  execute: (...args: unknown[]) => Promise<T | null>;
  reset: () => void;
  setData: (data: T) => void;
  setError: (error: ApiError | null) => void;
  setLoading: (loading: boolean) => void;
  refetch: () => Promise<T | null>;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Erro desconhecido';
}

function getErrorStatus(error: unknown): number {
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status?: number }).status;
    if (typeof status === 'number') {
      return status;
    }
  }
  return 500;
}

function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

function getErrorDetails(error: unknown): unknown {
  if (error && typeof error === 'object' && 'details' in error) {
    return (error as { details?: unknown }).details;
  }
  return error;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function getItemId(item: unknown): string | number | undefined {
  if (item && typeof item === 'object' && 'id' in item) {
    const id = (item as { id?: string | number }).id;
    return id;
  }
  return undefined;
}

export function useApi<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<ApiResponse<T>>,
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
  const executeRef = useRef<(...args: unknown[]) => Promise<T | null>>(async () => null);

  // Função para executar a API
  const execute = useCallback(
    async (...args: unknown[]): Promise<T | null> => {
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
      } catch (error: unknown) {
        // Verificar se foi cancelado
        if (isAbortError(error)) {
          return null;
        }

        const apiError: ApiError = {
          message: getErrorMessage(error),
          status: getErrorStatus(error),
          code: getErrorCode(error),
          details: getErrorDetails(error),
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
            void executeRef.current(...args);
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

  useEffect(() => {
    executeRef.current = execute;
  }, [execute]);

  // Execução automática se configurada
  useEffect(() => {
    if (autoExecute) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- autoExecute triggers initial fetch
      void execute();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dynamic dependency list from options
  }, [autoExecute, execute, ...dependencies]);
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
export function useCrudApi<T = unknown>(
  apiService: {
    get: (id: string) => Promise<ApiResponse<T>>;
    create: (data: unknown) => Promise<ApiResponse<T>>;
    update: (id: string, data: unknown) => Promise<ApiResponse<T>>;
    delete: (id: string) => Promise<ApiResponse<void>>;
    list: (params?: unknown) => Promise<ApiResponse<{ data: T[]; pagination?: PaginationMeta }>>;
  },
  options: UseApiOptions<T> = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const pendingDeleteIdRef = useRef<string | null>(null);

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
      const updatedId = getItemId(data);
      setItems(prev => prev.map(item =>
        getItemId(item) === updatedId ? data : item
      ));
      setSelectedItem(data);
    },
  });

  const deleteState = useApi(apiService.delete, {
    ...options,
    onSuccess: () => {
      const id = pendingDeleteIdRef.current;
      if (!id) {
        return;
      }
      setItems(prev => prev.filter(item => String(getItemId(item)) !== id));
      if (selectedItem && String(getItemId(selectedItem)) === id) {
        setSelectedItem(null);
      }
      pendingDeleteIdRef.current = null;
    },
  });

  const getItem = useCallback(async (id: string) => {
    return getState.execute(id);
  }, [getState]);

  const createItem = useCallback(async (data: unknown) => {
    return createState.execute(data);
  }, [createState]);

  const updateItem = useCallback(async (id: string, data: unknown) => {
    return updateState.execute(id, data);
  }, [updateState]);

  const deleteItem = useCallback(async (id: string) => {
    pendingDeleteIdRef.current = id;
    return deleteState.execute(id);
  }, [deleteState]);

  const listItems = useCallback(async (params?: unknown) => {
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
export function usePaginatedApi<T = unknown>(
  apiFunction: (params: unknown) => Promise<ApiResponse<{ data: T[]; pagination: PaginationMeta }>>,
  options: UseApiOptions<{ data: T[]; pagination: PaginationMeta }> = {}
) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  const apiState = useApi(apiFunction, {
    ...options,
    dependencies: [page, pageSize, filters],
  });

  const loadPage = useCallback(async (newPage: number, newPageSize?: number, newFilters?: Record<string, unknown>) => {
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
  }, [loadPage, page, apiState.data]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      loadPage(page - 1);
    }
  }, [loadPage, page]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && apiState.data?.pagination && newPage <= apiState.data.pagination.totalPages) {
      loadPage(newPage);
    }
  }, [loadPage, apiState.data]);

  const applyFilters = useCallback((newFilters: Record<string, unknown>) => {
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
