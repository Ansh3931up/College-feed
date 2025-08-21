import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosResponse, AxiosError } from 'axios';

// Custom hook for API state management
export interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAPIOptions {
  executeOnMount?: boolean;
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

// Generic hook for API calls
export function useAPI<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<AxiosResponse<T>>,
  options: UseAPIOptions = {}
) {
  const { executeOnMount = false, onSuccess, onError } = options;

  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: unknown[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        const data = response.data;

        setState({
          data,
          loading: false,
          error: null,
        });

        if (onSuccess) {
          onSuccess(data);
        }

        return { success: true, data };
      } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage = 
          axiosError.response?.data?.message || 
          axiosError.message || 
          'An unexpected error occurred';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (onError) {
          onError(errorMessage);
        }

        return { success: false, error: errorMessage };
      }
    },
    [apiFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Use ref to track if initial execution has happened
  const hasExecutedRef = useRef(false);
  
  useEffect(() => {
    if (executeOnMount && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      execute();
    }
  }, [executeOnMount]); // Removed execute from dependencies

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hooks for common patterns

// Hook for fetching data on mount
export function useFetch<T = unknown>(
  apiFunction: () => Promise<AxiosResponse<T>>,
  dependencies: unknown[] = []
) {
  const { data, loading, error, execute } = useAPI(apiFunction, {
    executeOnMount: true,
  });

  // Re-fetch when dependencies change
  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T = unknown>(
  apiFunction: (...args: unknown[]) => Promise<AxiosResponse<T>>,
  options: UseAPIOptions = {}
) {
  return useAPI(apiFunction, { ...options, executeOnMount: false });
}

// Hook for uploading files with progress
export function useUpload<T = unknown>(
  apiFunction: (formData: FormData, config?: unknown) => Promise<AxiosResponse<T>>
) {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const apiState = useAPI(
    (formData: FormData) => {
      return apiFunction(formData, {
        onUploadProgress: (progressEvent: { loaded: number; total: number }) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
    },
    { executeOnMount: false }
  );

  const reset = useCallback(() => {
    apiState.reset();
    setUploadProgress(0);
  }, [apiState]);

  return {
    ...apiState,
    uploadProgress,
    reset,
  };
}

// Hook for paginated data
export function usePagination<T = unknown>(
  apiFunction: (page: number, limit: number) => Promise<AxiosResponse<T>>,
  initialPage: number = 1,
  limit: number = 10
) {
  const [page, setPage] = useState(initialPage);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, execute } = useAPI(apiFunction, {
    executeOnMount: true,
  });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    const result = await execute(page + 1, limit);
    if (result.success && result.data) {
      const newData = Array.isArray(result.data) ? result.data : [result.data];
      setAllData(prev => [...prev, ...newData]);
      setPage(prev => prev + 1);
      
      // Check if there's more data
      if (newData.length < limit) {
        setHasMore(false);
      }
    }
  }, [page, limit, loading, hasMore, execute]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setAllData([]);
    setHasMore(true);
    execute(initialPage, limit);
  }, [initialPage, limit, execute]);

  useEffect(() => {
    if (data) {
      const newData = Array.isArray(data) ? data : [data];
      if (page === initialPage) {
        setAllData(newData);
      }
      setHasMore(newData.length === limit);
    }
  }, [data, page, initialPage, limit]);

  return {
    data: allData,
    loading,
    error,
    loadMore,
    hasMore,
    reset,
    currentPage: page,
  };
}

export default useAPI;
