import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useCategoriesQuery, useDeleteCategoryMutation } from './use-categories';
import { useDebounce } from './use-debounce';
import type { ApiSchema } from '@/http-clients';

type CategoryDto = ApiSchema['CategoryDto'];

interface UseCategoriesTableProps {
  onEditCategory: (category: CategoryDto) => void;
  onDeleteCategory: (category: CategoryDto) => void;
}

export function useCategoriesTable({ onEditCategory, onDeleteCategory }: UseCategoriesTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get URL parameters with defaults
  const page = parseInt(searchParams.get('page') ?? '1', 10);
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);
  const search = searchParams.get('search') ?? '';
  const sortBy = searchParams.get('sortBy') ?? 'name';
  const sortOrder = searchParams.get('sortOrder') ?? 'asc';

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: sortBy,
      desc: sortOrder === 'desc',
    },
  ]);

  const pagination: PaginationState = {
    pageIndex: page - 1, // TanStack Table uses 0-based indexing
    pageSize: limit,
  };

  // Fetch categories data
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useCategoriesQuery({
    search: debouncedSearch || undefined,
    page,
    limit,
    sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt',
    sortOrder: sortOrder as 'asc' | 'desc',
    flat: true,
  });

  const deleteCategory = useDeleteCategoryMutation();

  // Update URL when table state changes
  const updateSearchParams = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    setSearchParams(newParams);
  };

  // Handle search input change
  const handleSearchChange = (newSearch: string) => {
    updateSearchParams({
      search: newSearch,
      page: 1, // Reset to first page when searching
    });
  };

  // Handle pagination change
  const handlePaginationChange = (
    updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    const newPagination =
      typeof updaterOrValue === 'function' ? updaterOrValue(pagination) : updaterOrValue;
    updateSearchParams({
      page: newPagination.pageIndex + 1, // Convert back to 1-based indexing
      limit: newPagination.pageSize,
    });
  };

  // Handle sorting change
  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    const newSorting =
      typeof updaterOrValue === 'function' ? updaterOrValue(sorting) : updaterOrValue;
    setSorting(newSorting);

    if (newSorting.length > 0) {
      const sort = newSorting[0];
      updateSearchParams({
        sortBy: sort.id,
        sortOrder: sort.desc ? 'desc' : 'asc',
        page: 1, // Reset to first page when sorting changes
      });
    }
  };

  // Column definitions
  const columns = useMemo<ColumnDef<CategoryDto>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        enableSorting: true,
        cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
      },
      {
        id: 'slug',
        accessorKey: 'slug',
        header: 'Slug',
        enableSorting: false,
        cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('slug')}</div>,
      },
      {
        id: 'parent',
        accessorKey: 'parentId',
        header: 'Parent Category',
        enableSorting: false,
        cell: ({ row }) => {
          const parentId = row.getValue('parent') as string | null;
          if (!parentId) return <span className="text-muted-foreground">—</span>;

          // Find parent category name from the data
          const parentCategory = categoriesData?.data?.find((cat) => cat.id === parentId);
          return <div className="text-muted-foreground">{parentCategory?.name || 'Unknown'}</div>;
        },
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Created At',
        enableSorting: true,
        cell: ({ row }) => {
          const date = row.getValue('createdAt') as string;
          return (
            <div className="text-muted-foreground">
              {date ? format(new Date(date), 'MMM dd, yyyy') : '—'}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon-sm" onClick={() => onEditCategory(category)}>
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit category</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDeleteCategory(category)}
                className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete category</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [categoriesData?.data, onEditCategory, onDeleteCategory]
  );

  // Create table instance
  const table = useReactTable({
    data: categoriesData?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    manualSorting: true, // We handle sorting server-side
    manualPagination: true, // We handle pagination server-side
    pageCount: categoriesData?.meta.totalPages ?? 0,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: handlePaginationChange,
  });

  return {
    table,
    // Data state
    data: categoriesData,
    isLoading,
    error,
    // Search state and handlers
    search,
    debouncedSearch,
    handleSearchChange,
    // Pagination info
    pagination: {
      page,
      limit,
      totalItems: categoriesData?.meta.totalCount ?? 0,
      totalPages: categoriesData?.meta.totalPages ?? 0,
    },
    // Delete mutation
    deleteCategory,
  };
}
