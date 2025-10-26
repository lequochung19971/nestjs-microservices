import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import { format, isPast } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/use-debounce";
import { useToast } from "@/hooks/use-toast";

import { useReservations } from "../../hooks";
import type {
  InventoryReservationDto,
  ReservationQueryParams,
  ReservationStatus,
} from "../../types";

interface ReservationsTableProps {
  onCreateReservation: () => void;
  onManageReservation: (reservation: InventoryReservationDto) => void;
  inventoryItemId?: string;
}

export function ReservationsTable({
  onCreateReservation,
  onManageReservation,
  inventoryItemId,
}: ReservationsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | "ALL">(
    "ALL",
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { toast } = useToast();

  // Build query parameters
  const queryParams: ReservationQueryParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortField: sorting.length > 0 ? sorting[0].id : "createdAt",
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc",
    inventoryItemId: statusFilter === "ALL" ? undefined : inventoryItemId,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  };

  const { data, isLoading, isError } = useReservations(
    queryParams as ReservationQueryParams,
  );

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
  };

  const handlePageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as ReservationStatus | "ALL");
  };

  // Function to determine appropriate sort icon
  const getSortIcon = (column: any) => {
    const sortDirection = column.getIsSorted();
    if (sortDirection === "asc") {
      return <ArrowUp className="h-4 w-4" />;
    }
    if (sortDirection === "desc") {
      return <ArrowDown className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Helper function to format reservation status
  const formatReservationStatus = (status: string, expiresAt?: string) => {
    if (status === "ACTIVE" && expiresAt && isPast(new Date(expiresAt))) {
      return <Badge variant="secondary">Expired</Badge>;
    }

    switch (status) {
      case "ACTIVE":
        return <Badge>Active</Badge>;
      case "FULFILLED":
        return <Badge variant="default">Fulfilled</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const columns: ColumnDef<InventoryReservationDto>[] = [
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => (
        <div>{format(new Date(row.original.createdAt), "MMM d, yyyy")}</div>
      ),
      sortingFn: "datetime",
    },
    {
      id: "inventoryItemId",
      accessorKey: "inventoryItemId",
      header: "Inventory Item",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.original.inventoryItemId.substring(0, 8)}
        </div>
      ),
    },
    {
      id: "orderId",
      accessorKey: "orderId",
      header: "Order ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.original.orderId.substring(0, 8)}
        </div>
      ),
    },
    {
      id: "quantity",
      accessorKey: "quantity",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Quantity
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.original.quantity}</div>
      ),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) =>
        formatReservationStatus(row.original.status, row.original.expiresAt),
    },
    {
      id: "expiresAt",
      accessorKey: "expiresAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Expires
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => {
        if (!row.original.expiresAt) return <div>No expiry</div>;

        const expiryDate = new Date(row.original.expiresAt);
        const isExpired = isPast(expiryDate);

        return (
          <div className={isExpired ? "text-destructive" : ""}>
            {format(expiryDate, "MMM d, yyyy")}
          </div>
        );
      },
      sortingFn: "datetime",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onManageReservation(row.original)}
            title="Manage Reservation"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: data?.meta?.totalCount || -1,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex items-center space-x-2 w-full max-w-[250px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="flex items-center space-x-2 w-full max-w-[200px]">
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={onCreateReservation}
          size="sm"
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Reservation
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header instanceof Function
                        ? header.column.columnDef.header({
                            column: header.column,
                            header: header,
                            table: table,
                          })
                        : header.column.columnDef.header}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-red-500"
                >
                  Error loading reservations
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No reservations found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {cell.column.columnDef.cell instanceof Function
                        ? cell.column.columnDef.cell({
                            cell,
                            row,
                            table,
                            column: cell.column,
                            getValue: cell.getValue,
                            renderValue: cell.renderValue,
                          })
                        : cell.getValue()}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {data?.meta && (
        <PaginationControls
          currentPage={pagination.pageIndex + 1}
          totalPages={data?.meta?.totalPages || 1}
          pageSize={pagination.pageSize}
          totalItems={data?.meta?.totalCount || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
}
