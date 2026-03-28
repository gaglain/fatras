import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface UsePaginatedQueryOptions<T> {
  table: TableName;
  pageSize?: number;
  orderBy?: string;
  ascending?: boolean;
  select?: string;
  mapFn?: (row: any) => T;
}

interface PaginatedResult<T> {
  data: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
  total: number | null;
}

export function usePaginatedQuery<T = any>({
  table,
  pageSize = 50,
  orderBy = 'created_at',
  ascending = false,
  select = '*',
  mapFn,
}: UsePaginatedQueryOptions<T>): PaginatedResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState<number | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);

    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const query = supabase
        .from(table)
        .select(select, { count: 'exact' })
        .order(orderBy, { ascending })
        .range(from, to);

      const { data: rows, error, count } = await query;

      if (error) throw error;

      const mapped = mapFn ? (rows || []).map(mapFn) : (rows || []) as T[];

      setData(prev => (page === 0 ? mapped : [...prev, ...mapped]));
      setTotal(count);
      setHasMore((rows || []).length === pageSize);
      setPage(p => p + 1);
    } catch (error) {
      logger.error(`Pagination error for ${table}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, [table, pageSize, orderBy, ascending, select, mapFn, page, isLoading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(0);
    setHasMore(true);
    setTotal(null);
  }, []);

  return { data, isLoading, hasMore, loadMore, reset, total };
}
