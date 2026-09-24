import { useEffect, useState } from 'react';
import { useDebounce } from './useDebounce';

export function useListParams(defaultLimit = 20, resetKeys: Array<string | null | undefined> = []) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit, ...resetKeys]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    debouncedSearch,
    query: {
      page,
      limit,
      search: debouncedSearch || undefined,
    },
  };
}
