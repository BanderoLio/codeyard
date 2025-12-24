import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/navigation';
import { useDebounce } from '@/lib/hooks/use-debounce';

export type TSortOption = 'created_at' | '-created_at' | 'name' | '-name';

export function useCatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams() ?? new URLSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    searchParams.get('category')
      ? Number(searchParams.get('category'))
      : undefined,
  );
  const [difficultyFilter, setDifficultyFilter] = useState<number | undefined>(
    searchParams.get('difficulty')
      ? Number(searchParams.get('difficulty'))
      : undefined,
  );
  const [sortBy, setSortBy] = useState<TSortOption>(
    (searchParams.get('sort') as TSortOption) || '-created_at',
  );
  const [page, setPage] = useState(
    searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  );
  const [myTasksOnly, setMyTasksOnly] = useState(
    searchParams.get('my_tasks') === 'true',
  );
  const [solvedByMe, setSolvedByMe] = useState(
    searchParams.get('solved_by_me') === 'true',
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryFilter) params.set('category', categoryFilter.toString());
    if (difficultyFilter) params.set('difficulty', difficultyFilter.toString());
    if (sortBy !== '-created_at') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());
    if (myTasksOnly) params.set('my_tasks', 'true');
    if (solvedByMe) params.set('solved_by_me', 'true');

    const newUrl = params.toString()
      ? `/catalog?${params.toString()}`
      : '/catalog';
    router.replace(newUrl, { scroll: false });
  }, [
    debouncedSearch,
    categoryFilter,
    difficultyFilter,
    sortBy,
    page,
    myTasksOnly,
    solvedByMe,
    router,
  ]);

  const resetPage = () => setPage(1);

  return {
    search,
    setSearch,
    debouncedSearch,
    categoryFilter,
    setCategoryFilter,
    difficultyFilter,
    setDifficultyFilter,
    sortBy,
    setSortBy,
    page,
    setPage,
    resetPage,
    myTasksOnly,
    setMyTasksOnly,
    solvedByMe,
    setSolvedByMe,
  };
}
