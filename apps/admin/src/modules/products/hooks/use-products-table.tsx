import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type PaginationState,
} from "@tanstack/react-table";
import { Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts, useDeleteProduct } from "./use-products";
import { useDebounce } from "../../../hooks/use-debounce";
import type { ApiSchema } from "@/http-clients";

type ProductDto = ApiSchema["ProductDto"];

interface UseProductsTableProps {
  onEditProduct: (product: ProductDto) => void;
  onDeleteProduct: (product: ProductDto) => void;
}

export function useProductsTable({
  onEditProduct,
  onDeleteProduct,
}: UseProductsTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get URL parameters with defaults
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "name";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: sortBy,
      desc: sortOrder === "desc",
    },
  ]);

  const pagination: PaginationState = {
    pageIndex: page - 1, // TanStack Table uses 0-based indexing
    pageSize: limit,
  };

  // Fetch products data
  const {
    data: productsData,
    isLoading,
    error,
  } = useProducts({
    search: debouncedSearch || undefined,
    page,
    limit,
    sortBy: sortBy as "name" | "price" | "sku" | "createdAt" | "updatedAt",
    sortOrder: sortOrder as "asc" | "desc",
    includeCategories: true,
    includeMedia: true,
  });

  const deleteProduct = useDeleteProduct();

  // Update URL when table state changes
  const updateSearchParams = (
    updates: Record<string, string | number | undefined>,
  ) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === "") {
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
    updaterOrValue:
      | PaginationState
      | ((old: PaginationState) => PaginationState),
  ) => {
    const newPagination =
      typeof updaterOrValue === "function"
        ? updaterOrValue(pagination)
        : updaterOrValue;
    updateSearchParams({
      page: newPagination.pageIndex + 1, // Convert back to 1-based indexing
      limit: newPagination.pageSize,
    });
  };

  // Handle sorting change
  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const newSorting =
      typeof updaterOrValue === "function"
        ? updaterOrValue(sorting)
        : updaterOrValue;
    setSorting(newSorting);

    if (newSorting.length > 0) {
      const sort = newSorting[0];
      updateSearchParams({
        sortBy: sort.id,
        sortOrder: sort.desc ? "desc" : "asc",
        page: 1, // Reset to first page when sorting changes
      });
    }
  };

  // Format currency display
  const formatPrice = (price: string, currency: string) => {
    const amount = parseFloat(price);
    const currencySymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      JPY: "¥",
      CAD: "C$",
      AUD: "A$",
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  // Column definitions
  const columns = useMemo<ColumnDef<ProductDto>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Product",
        enableSorting: true,
        cell: ({ row }) => {
          const product = row.original;
          const primaryImage = product.images?.find(
            (img) => img.id === product.images?.[0]?.id,
          );

          return (
            <div className="flex items-center gap-3">
              {primaryImage ? (
                <img
                  src={primaryImage.url}
                  alt={product.name}
                  className="h-10 w-10 rounded-md object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    No Image
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-muted-foreground">
                  {product.sku}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "price",
        accessorKey: "price",
        header: "Price",
        enableSorting: true,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="font-mono">
              {formatPrice(product.price, product.currency)}
            </div>
          );
        },
      },
      {
        id: "categories",
        accessorKey: "categories",
        header: "Categories",
        enableSorting: false,
        cell: ({ row }) => {
          const categories = row.getValue(
            "categories",
          ) as ProductDto["categories"];
          if (!categories || categories.length === 0) {
            return <span className="text-muted-foreground">—</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {categories.slice(0, 2).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {category.name}
                </Badge>
              ))}
              {categories.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{categories.length - 2}
                </Badge>
              )}
            </div>
          );
        },
      },
      {
        id: "isActive",
        accessorKey: "isActive",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => {
          const isActive = row.getValue("isActive") as boolean;
          return (
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: "Created",
        enableSorting: true,
        cell: ({ row }) => {
          const date = row.getValue("createdAt") as string;
          return (
            <div className="text-muted-foreground">
              {date ? format(new Date(date), "MMM dd, yyyy") : "—"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const product = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onEditProduct(product)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit product</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDeleteProduct(product)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete product</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [onEditProduct, onDeleteProduct],
  );

  // Create table instance
  const table = useReactTable({
    data: productsData?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    manualSorting: true, // We handle sorting server-side
    manualPagination: true, // We handle pagination server-side
    pageCount: productsData?.meta?.totalPages ?? 0,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: handlePaginationChange,
  });

  return {
    table,
    // Data state
    data: productsData,
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
      totalItems: productsData?.meta?.total ?? 0,
      totalPages: productsData?.meta?.totalPages ?? 0,
    },
    // Delete mutation
    deleteProduct,
  };
}
