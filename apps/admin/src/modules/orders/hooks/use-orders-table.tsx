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
import { Eye, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "./use-orders";
import { useDebounce } from "../../../hooks/use-debounce";
import type { ApiSchema } from "@/http-clients";

type OrderDto = ApiSchema["OrderDto"];

interface UseOrdersTableProps {
  onViewOrder: (order: OrderDto) => void;
  onCancelOrder: (order: OrderDto) => void;
}

export function useOrdersTable({
  onViewOrder,
  onCancelOrder,
}: UseOrdersTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get URL parameters with defaults
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const search = searchParams.get("search") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = searchParams.get("sortOrder") ?? "desc";
  const statusFilter = searchParams.get("status") ?? undefined;
  const paymentStatusFilter = searchParams.get("paymentStatus") ?? undefined;

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

  // Fetch orders data
  const {
    data: ordersData,
    isLoading,
    error,
  } = useOrders({
    search: debouncedSearch || undefined,
    page,
    limit,
    sortBy: sortBy as "orderNumber" | "createdAt" | "totalAmount",
    sortOrder: sortOrder as "asc" | "desc",
    status: statusFilter as ApiSchema["OrderDto"]["status"],
    paymentStatus:
      paymentStatusFilter as ApiSchema["OrderDto"]["paymentStatus"],
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
  const formatPrice = (price: string) => {
    const amount = parseFloat(price);
    return `$${amount.toFixed(2)}`;
  };

  // Get status badge variant
  const getOrderStatusVariant = (
    status: OrderDto["status"],
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "CONFIRMED":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "SHIPPED":
        return "default";
      case "DELIVERED":
        return "default";
      case "CANCELLED":
        return "destructive";
      case "REFUNDED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentStatusVariant = (
    status: OrderDto["paymentStatus"],
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "PENDING":
        return "outline";
      case "PAID":
        return "default";
      case "FAILED":
        return "destructive";
      case "REFUNDED":
        return "secondary";
      case "PARTIALLY_REFUNDED":
        return "outline";
      default:
        return "outline";
    }
  };

  // Column definitions
  const columns = useMemo<ColumnDef<OrderDto>[]>(
    () => [
      {
        id: "orderNumber",
        accessorKey: "orderNumber",
        header: "Order Number",
        enableSorting: true,
        cell: ({ row }) => {
          const order = row.original;
          return (
            <div className="font-mono font-medium">{order.orderNumber}</div>
          );
        },
      },
      {
        id: "customerId",
        accessorKey: "customerId",
        header: "Customer ID",
        enableSorting: false,
        cell: ({ row }) => {
          const customerId = row.getValue("customerId") as string;
          return (
            <div className="font-mono text-sm text-muted-foreground">
              {customerId.substring(0, 8)}...
            </div>
          );
        },
      },
      {
        id: "status",
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.getValue("status") as OrderDto["status"];
          return (
            <Badge variant={getOrderStatusVariant(status)}>
              {status.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        id: "paymentStatus",
        accessorKey: "paymentStatus",
        header: "Payment",
        enableSorting: true,
        cell: ({ row }) => {
          const paymentStatus = row.getValue(
            "paymentStatus",
          ) as OrderDto["paymentStatus"];
          return (
            <Badge variant={getPaymentStatusVariant(paymentStatus)}>
              {paymentStatus.replace("_", " ")}
            </Badge>
          );
        },
      },
      {
        id: "totalAmount",
        accessorKey: "totalAmount",
        header: "Total",
        enableSorting: true,
        cell: ({ row }) => {
          const totalAmount = row.getValue("totalAmount") as string;
          return <div className="font-mono">{formatPrice(totalAmount)}</div>;
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
              {date ? format(new Date(date), "MMM dd, yyyy HH:mm") : "—"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => {
          const order = row.original;
          const canCancel = !["CANCELLED", "REFUNDED", "DELIVERED"].includes(
            order.status,
          );
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onViewOrder(order)}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">View order</span>
              </Button>
              {canCancel && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCancelOrder(order)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cancel order</span>
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [onViewOrder, onCancelOrder],
  );

  // Create table instance
  const table = useReactTable({
    data: ordersData?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    manualSorting: true, // We handle sorting server-side
    manualPagination: true, // We handle pagination server-side
    pageCount: ordersData?.meta?.totalPages ?? 0,
    state: {
      sorting,
      pagination,
    },
    onPaginationChange: handlePaginationChange,
  });

  return {
    table,
    // Data state
    data: ordersData,
    isLoading,
    error,
    // Search state and handlers
    search,
    debouncedSearch,
    handleSearchChange,
    // Filter state
    statusFilter,
    paymentStatusFilter,
    // Pagination info
    pagination: {
      page,
      limit,
      totalItems: ordersData?.meta?.totalCount ?? 0,
      totalPages: ordersData?.meta?.totalPages ?? 0,
    },
  };
}
