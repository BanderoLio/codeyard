'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
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
import Link from 'next/link';
import { Search, Plus } from 'lucide-react';
import type {
  TProgrammingTask,
  TCategory,
  TDifficulty,
} from '@/features/catalog/types';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';

function TaskCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border p-4 shadow-sm">
      <Skeleton className="mb-2 h-6 w-3/4" />
      <Skeleton className="mb-4 h-4 w-full" />
      <Skeleton className="mb-4 h-4 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="mt-3 h-4 w-1/2" />
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
  const category = categories?.find((c) => c.id === task.category);
  const difficulty = difficulties?.find((d) => d.id === task.difficulty);

  return (
    <Link href={`/catalog/${task.id}`}>
      <div className="group bg-card rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md">
        <h3 className="card-foreground group-hover:text-primary text-lg font-semibold">
          {task.name}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
          {task.description}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {category && (
            <span className="bg-muted text-muted-foreground rounded px-2 py-1">
              {category.name}
            </span>
          )}
          {difficulty && (
            <span className="bg-muted text-muted-foreground rounded px-2 py-1">
              {difficulty.name}
            </span>
          )}
        </div>
        <div className="text-muted-foreground mt-3 flex items-center gap-4 text-xs">
          <span>By {task.added_by}</span>
          <span>•</span>
          <span>{new Date(task.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

export function CatalogPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [difficultyFilter, setDifficultyFilter] = useState<
    number | undefined
  >();
  const [page, setPage] = useState(1);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: difficulties } = useQuery({
    queryKey: ['difficulties'],
    queryFn: () => catalogApi.getDifficulties(),
  });

  const { data: tasksData, isLoading } = useQuery({
    queryKey: [
      'tasks',
      debouncedSearch,
      categoryFilter,
      difficultyFilter,
      page,
    ],
    queryFn: () =>
      catalogApi.getTasks({
        search: debouncedSearch || undefined,
        category: categoryFilter,
        difficulty: difficultyFilter,
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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Task Catalog</h1>
        <Button asChild>
          <Link href="/catalog/create-task">
            <Plus className="mr-2 h-4 w-4" />
            Create Task
          </Link>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
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
          />
        </div>

        <Select
          value={categoryFilter?.toString() || 'all'}
          onValueChange={(value: string) => {
            setCategoryFilter(value === 'all' ? undefined : Number(value));
            setPage(1);
          }}
        >
          <SelectTrigger>
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
          <SelectTrigger>
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
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-muted-foreground py-12 text-center">
          No tasks found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="text-muted-foreground text-sm">
                Page {page} of {totalPages > 0 ? totalPages : 1} • {totalCount}{' '}
                {totalCount === 1 ? 'task' : 'tasks'} total
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!hasPrevious}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
