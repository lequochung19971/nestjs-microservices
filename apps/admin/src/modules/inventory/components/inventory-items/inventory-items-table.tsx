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
  Edit,
  Trash2,
  Plus,
  Search,
  BarChart3,
} from "lucide-react";

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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";

import {
  useDeleteInventoryItem,
  useInventoryItems,
  useWarehouses,
} from "../../hooks";
import type {
  InventoryItemDto,
  InventoryItemQueryParams,
  InventoryStatus,
} from "../../types";

interface InventoryItemsTableProps {
  onCreateInventoryItem: () => void;
  onEditInventoryItem: (item: InventoryItemDto) => void;
  onAdjustQuantity: (item: InventoryItemDto) => void;
  warehouseId?: string;
  productId?: string;
}

export function InventoryItemsTable({
  onCreateInventoryItem,
  onEditInventoryItem,
  onAdjustQuantity,
  warehouseId,
  productId,
}: InventoryItemsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItemDto | null>(
    null,
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<InventoryStatus | "ALL">(
    "ALL",
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(
    warehouseId || "",
  );
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { toast } = useToast();
  const { mutateAsync: deleteItem, isPending: isDeleting } =
    useDeleteInventoryItem();
  const { data: warehousesData } = useWarehouses();

  // Build query parameters
  const queryParams: InventoryItemQueryParams = {
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortField: sorting.length > 0 ? sorting[0].id : "updatedAt",
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc",
    warehouseId: statusFilter === "ALL" ? undefined : selectedWarehouseId,
    productId: productId || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
  };

  const { data, isLoading, isError } = useInventoryItems(queryParams);

  const handleDeleteItem = (item: InventoryItemDto) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (itemToDelete) {
        await deleteItem(itemToDelete.id);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      toast.error(
        `Failed to delete inventory item: ${error instanceof Error ? error.message : "Unknown error"} as ${typeof error}`,
      );
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
  };

  const handlePageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize);
  };

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouseId(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value as InventoryStatus | "ALL");
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

  // Function to determine color for inventory level
  const getInventoryLevelBadge = (item: InventoryItemDto) => {
    if (item.quantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (item.reorderPoint !== undefined && item.quantity <= item.reorderPoint) {
      return <Badge variant="secondary">Low Stock</Badge>;
    }
    return <Badge variant="default">{item.quantity} in stock</Badge>;
  };

  const columns: ColumnDef<InventoryItemDto>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.original.id.substring(0, 8)}
        </div>
      ),
    },
    {
      id: "warehouseId",
      accessorKey: "warehouseId",
      header: "Warehouse",
      cell: ({ row }) => {
        const warehouseId = row.original.warehouseId;
        const warehouse = warehousesData?.data?.find(
          (w) => w.id === warehouseId,
        );
        return (
          <div>{warehouse?.name || warehouseId?.substring(0, 8) || "N/A"}</div>
        );
      },
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
      cell: ({ row }) => getInventoryLevelBadge(row.original),
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
    },
    {
      id: "reorderPoint",
      accessorKey: "reorderPoint",
      header: "Reorder Point",
      cell: ({ row }) => <div>{row.original.reorderPoint || "Not set"}</div>,
    },
    {
      id: "reservedQuantity",
      accessorKey: "reservedQuantity",
      header: "Reserved",
      cell: ({ row }) => (
        <div>
          {row.original.reservedQuantity > 0 ? (
            <Badge variant="secondary">{row.original.reservedQuantity}</Badge>
          ) : (
            "0"
          )}
        </div>
      ),
    },
    {
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Updated
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.updatedAt);
        return <div>{date.toLocaleDateString()}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAdjustQuantity(row.original)}
            title="Adjust Quantity"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditInventoryItem(row.original)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteItem(row.original)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
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
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!warehouseId && (
            <div className="flex items-center space-x-2 w-full max-w-[250px]">
              <Select
                value={selectedWarehouseId}
                onValueChange={handleWarehouseChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Warehouses</SelectItem>
                  {warehousesData?.data?.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={onCreateInventoryItem}
          size="sm"
          className="whitespace-nowrap"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory Item
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
                  Error loading inventory items
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No inventory items found
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
          totalPages={data.meta.totalPages || 1}
          pageSize={pagination.pageSize}
          totalItems={data.meta.totalCount || 0}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this inventory item. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleDeleteCancel}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
