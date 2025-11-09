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
import { Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomers } from "./use-customers";
import { useDebounce } from "../../../hooks/use-debounce";
import type { ApiSchema } from "@/http-clients";

type CustomerDto = ApiSchema["CustomerDto"];

interface UseCustomersTableProps {
  onViewCustomer?: (customer: CustomerDto) => void;
}

export function useCustomersTable({
  onViewCustomer,
}: UseCustomersTableProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get URL parameters with defaults
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";

  // Debounce search to avoid excessive API calls
  const debouncedSearch = useDebounce(search, 500);

  // TanStack Table state
  const [sorting, setSorting] = useState<SortingState>([]);

  const pagination: PaginationState = {
    pageIndex: page - 1, // TanStack Table uses 0-based indexing
    pageSize: limit,
  };

  // Fetch customers data
  const {
    data: customersData,
    isLoading,
    error,
  } = useCustomers({
    search: debouncedSearch || undefined,
    page,
    limit,
  });

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
  };

  // Column definitions
  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () => [
      {
        id: "username",
        accessorKey: "username",
        header: "Username",
        enableSorting: true,
        cell: ({ row }) => {
          const customer = row.original;
          return <div className="font-medium">{customer.username}</div>;
        },
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        enableSorting: true,
        cell: ({ row }) => {
          const email = row.getValue("email") as string;
          return <div className="text-sm">{email}</div>;
        },
      },
      {
        id: "fullName",
        accessorKey: "firstName",
        header: "Full Name",
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          const fullName = [customer.firstName, customer.lastName]
            .filter(Boolean)
            .join(" ");
          return (
            <div className="text-sm text-muted-foreground">
              {fullName || "—"}
            </div>
          );
        },
      },
      {
        id: "enabled",
        accessorKey: "enabled",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => {
          const enabled = row.getValue("enabled") as boolean;
          return (
            <Badge variant={enabled ? "default" : "secondary"}>
              {enabled ? "Enabled" : "Disabled"}
            </Badge>
          );
        },
      },
      {
        id: "emailVerified",
        accessorKey: "emailVerified",
        header: "Email Status",
        enableSorting: false,
        cell: ({ row }) => {
          const emailVerified = row.getValue("emailVerified") as boolean;
          return (
            <Badge variant={emailVerified ? "default" : "outline"}>
              {emailVerified ? "Verified" : "Unverified"}
            </Badge>
          );
        },
      },
      {
        id: "createdTimestamp",
        accessorKey: "createdTimestamp",
        header: "Created",
        enableSorting: true,
        cell: ({ row }) => {
          const timestamp = row.getValue("createdTimestamp") as
            | number
            | undefined;
          return (
            <div className="text-muted-foreground text-sm">
              {timestamp
                ? format(new Date(timestamp), "MMM dd, yyyy HH:mm")
                : "—"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const customer = row.original;
          return (
            <div className="flex items-center gap-2">
              {onViewCustomer && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onViewCustomer(customer)}
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">View customer</span>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onViewCustomer],
  );

  // Create table instance
  const table = useReactTable({
    data: customersData?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    manualSorting: false, // Client-side sorting for now
    manualPagination: true, // Server-side pagination
    pageCount: customersData?.meta?.totalPages ?? 0,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: handlePaginationChange,
  });

  return {
    table,
    // Data state
    data: customersData,
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
      totalItems: customersData?.meta?.totalCount ?? 0,
      totalPages: customersData?.meta?.totalPages ?? 0,
    },
  };
}
