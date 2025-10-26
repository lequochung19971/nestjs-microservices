import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  Search,
  Eye,
} from "lucide-react";
import { format } from "date-fns";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

import { useTransactions } from "../../hooks";
import type {
  InventoryTransactionDto,
  TransactionQueryParams,
  TransactionType,
} from "../../types";

interface TransactionsTableProps {
  onCreateTransaction: () => void;
  onViewTransaction: (transaction: InventoryTransactionDto) => void;
  inventoryItemId?: string;
}

export function TransactionsTable({
  onCreateTransaction,
  onViewTransaction,
  inventoryItemId,
}: TransactionsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { toast } = useToast();

  // Build query parameters
  const queryParams: TransactionQueryParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortField: sorting.length > 0 ? sorting[0].id : "createdAt",
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc",
    inventoryItemId: typeFilter === "ALL" ? undefined : inventoryItemId,
    type: typeFilter === "ALL" ? undefined : typeFilter,
  };

  const { data, isLoading, isError } = useTransactions(queryParams);

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
  };

  const handlePageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize);
  };

  const handleTypeChange = (value: string) => {
    setTypeFilter(value as TransactionType | "ALL");
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

  // Helper function to format transaction type
  const formatTransactionType = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <Badge variant="default">Purchase</Badge>;
      case "SALE":
        return <Badge variant="destructive">Sale</Badge>;
      case "RETURN":
        return <Badge variant="secondary">Return</Badge>;
      case "ADJUSTMENT":
        return <Badge variant="outline">Adjustment</Badge>;
      case "TRANSFER":
        return <Badge variant="secondary">Transfer</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  const columns: ColumnDef<InventoryTransactionDto>[] = [
    {
      id: "createdAt",
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          {format(new Date(row.original.createdAt), "MMM d, yyyy h:mm a")}
        </div>
      ),
      sortingFn: "datetime",
    },
    {
      id: "type",
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => formatTransactionType(row.original.type),
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
      cell: ({ row }) => {
        const quantity = row.original.quantity;
        return (
          <div className={quantity < 0 ? "text-destructive" : "text-green-600"}>
            {quantity}
          </div>
        );
      },
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
      id: "referenceType",
      accessorKey: "referenceType",
      header: "Reference Type",
      cell: ({ row }) => <div>{row.original.referenceType || "N/A"}</div>,
    },
    {
      id: "referenceId",
      accessorKey: "referenceId",
      header: "Reference ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.original.referenceId
            ? row.original.referenceId.substring(0, 8)
            : "N/A"}
        </div>
      ),
    },
    {
      id: "createdBy",
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => <div>{row.original.createdBy || "System"}</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onViewTransaction(row.original)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
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
            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
                <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={onCreateTransaction}
          size="sm"
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
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
                            table: table,
                            header: header,
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
                  Error loading transactions
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No transactions found
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
          totalItems={data.meta.totalCount || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}
    </div>
  );
}
