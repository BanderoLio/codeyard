'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TCategory, TDifficulty } from '../types';
import type { TSortOption } from '../hooks/use-catalog-filters';

type TCatalogFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter?: number;
  onCategoryChange: (value: number | undefined) => void;
  difficultyFilter?: number;
  onDifficultyChange: (value: number | undefined) => void;
  sortBy: TSortOption;
  onSortChange: (value: TSortOption) => void;
  categories?: TCategory[];
  difficulties?: TDifficulty[];
};

export function CatalogFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  difficultyFilter,
  onDifficultyChange,
  sortBy,
  onSortChange,
  categories,
  difficulties,
}: TCatalogFiltersProps) {
  const t = useTranslations('Catalog');

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label={t('searchPlaceholder')}
        />
      </div>

      <Select
        value={categoryFilter?.toString() || 'all'}
        onValueChange={(value: string) =>
          onCategoryChange(value === 'all' ? undefined : Number(value))
        }
      >
        <SelectTrigger aria-label={t('allCategories')}>
          <SelectValue placeholder={t('allCategories')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allCategories')}</SelectItem>
          {categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id.toString()}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={difficultyFilter?.toString() || 'all'}
        onValueChange={(value: string) =>
          onDifficultyChange(value === 'all' ? undefined : Number(value))
        }
      >
        <SelectTrigger aria-label={t('allDifficulties')}>
          <SelectValue placeholder={t('allDifficulties')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t('allDifficulties')}</SelectItem>
          {difficulties?.map((diff) => (
            <SelectItem key={diff.id} value={diff.id.toString()}>
              {diff.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(value: string) => onSortChange(value as TSortOption)}
      >
        <SelectTrigger aria-label={t('sortBy')}>
          <SelectValue placeholder={t('sortBy')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-created_at">
            <span className="flex items-center gap-2">
              <ArrowDown className="h-4 w-4" />
              {t('sortNewest')}
            </span>
          </SelectItem>
          <SelectItem value="created_at">
            <span className="flex items-center gap-2">
              <ArrowUp className="h-4 w-4" />
              {t('sortOldest')}
            </span>
          </SelectItem>
          <SelectItem value="name">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {t('sortNameAsc')}
            </span>
          </SelectItem>
          <SelectItem value="-name">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {t('sortNameDesc')}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
