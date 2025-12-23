'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/navigation';
import { catalogApi } from '@/features/catalog/catalog.api';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import type {
  TProgrammingTask,
  TCategory,
  TDifficulty,
} from '@/features/catalog/types';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-display';
import { getErrorMessage } from '@/lib/utils/error-handler';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

function TaskCardSkeleton() {
  return (
    <div
      className="bg-card rounded-lg border p-4 shadow-sm"
      role="status"
      aria-label="Loading task"
    >
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="mt-3 h-4 w-1/2" />
      <span className="sr-only">Loading task card...</span>
    </div>
  );
}

function TaskCard({
  task,
  categories,
  difficulties,
}: {
  task: TProgrammingTask;
  categories?: TCategory[];
  difficulties?: TDifficulty[];
}) {
  const queryClient = useQueryClient();
  const category = categories?.find((c) => c.id === task.category);
  const difficulty = difficulties?.find((d) => d.id === task.difficulty);

  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['task', task.id],
      queryFn: () => catalogApi.getTask(task.id),
    });
    queryClient.prefetchQuery({
      queryKey: ['solutions', task.id],
      queryFn: () => catalogApi.getSolutions({ task: task.id }),
    });
  };

  return (
    <Link
      href={`/catalog/${task.id}`}
      className="block h-full"
      aria-label={`View task: ${task.name}`}
      onMouseEnter={handleMouseEnter}
    >
      <article className="group bg-card hover:border-primary/50 h-full rounded-lg border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
        <h3 className="card-foreground group-hover:text-primary text-lg font-semibold transition-colors duration-200">
          {task.name}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
          {task.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {category && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-medium">
              {category.name}
            </span>
          )}
          {difficulty && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 font-medium">
              {difficulty.name}
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-4 flex items-center gap-2 border-t pt-3 text-xs">
          <span className="font-medium">By {task.added_by}</span>
          <span>•</span>
          <time dateTime={task.created_at}>
            {new Date(task.created_at).toLocaleDateString()}
          </time>
        </div>
      </article>
    </Link>
  );
}

type SortOption = 'created_at' | '-created_at' | 'name' | '-name';

export function CatalogPage() {
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
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || '-created_at',
  );
  const [page, setPage] = useState(
    searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (categoryFilter) params.set('category', categoryFilter.toString());
    if (difficultyFilter) params.set('difficulty', difficultyFilter.toString());
    if (sortBy !== '-created_at') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());

    const newUrl = params.toString()
      ? `/catalog?${params.toString()}`
      : '/catalog';
    router.replace(newUrl, { scroll: false });
  }, [debouncedSearch, categoryFilter, difficultyFilter, sortBy, page, router]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: difficulties } = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  const {
    data: tasksData,
    isLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: [
      'tasks',
      debouncedSearch,
      categoryFilter,
      difficultyFilter,
      sortBy,
      page,
    ],
    queryFn: () =>
      catalogApi.getTasks({
        search: debouncedSearch || undefined,
        category: categoryFilter,
        difficulty: difficultyFilter,
        ordering: sortBy,
        page,
      }),
  });

  const tasks = tasksData?.results || [];
  const hasNext = !!tasksData?.next;
  const hasPrevious = !!tasksData?.previous;
  const totalCount = tasksData?.count || 0;
  const pageSize = 20;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 1;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Catalog</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Task Catalog</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/catalog/create-task">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>

        <Select
          value={categoryFilter?.toString() || 'all'}
          onValueChange={(value: string) => {
            setCategoryFilter(value === 'all' ? undefined : Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={difficultyFilter?.toString() || 'all'}
          onValueChange={(value: string) => {
            setDifficultyFilter(value === 'all' ? undefined : Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by difficulty">
            <SelectValue placeholder="All Difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulties</SelectItem>
            {difficulties?.map((diff) => (
              <SelectItem key={diff.id} value={diff.id.toString()}>
                {diff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: string) => {
            setSortBy(value as SortOption);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Sort tasks">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_at">
              <span className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4" />
                Newest first
              </span>
            </SelectItem>
            <SelectItem value="created_at">
              <span className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                Oldest first
              </span>
            </SelectItem>
            <SelectItem value="name">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Name A-Z
              </span>
            </SelectItem>
            <SelectItem value="-name">
              <span className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4" />
                Name Z-A
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          role="status"
          aria-label="Loading tasks"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
          <span className="sr-only">Loading tasks...</span>
        </div>
      ) : tasksError ? (
        <ErrorDisplay
          message={getErrorMessage(tasksError)}
          onRetry={() => refetchTasks()}
          className="mx-auto max-w-2xl"
        />
      ) : tasks.length === 0 ? (
        <div className="bg-card border-muted flex flex-col items-center justify-center rounded-lg border py-12 text-center sm:py-16">
          <div className="mb-4 text-4xl sm:text-6xl">📋</div>
          <h3 className="mb-2 text-lg font-semibold sm:text-xl">
            No tasks found
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md px-4 text-sm sm:text-base">
            {debouncedSearch || categoryFilter || difficultyFilter
              ? 'Try adjusting your filters or search query to find more tasks.'
              : 'Be the first to create a task and share it with the community!'}
          </p>
          {!debouncedSearch && !categoryFilter && !difficultyFilter && (
            <Button asChild className="w-full sm:w-auto">
              <Link href="/catalog/create-task">
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                categories={categories}
                difficulties={difficulties}
              />
            ))}
          </div>

          {(hasNext || hasPrevious) && (
            <nav
              className="mt-8 flex flex-col items-center gap-4"
              aria-label="Pagination"
            >
              <div className="text-muted-foreground text-sm" aria-live="polite">
                Page {page} of {totalPages > 0 ? totalPages : 1} • {totalCount}{' '}
                {totalCount === 1 ? 'task' : 'tasks'} total
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevious}
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                  aria-label="Go to next page"
                >
                  Next
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
