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
import { format } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

import { useDebounce } from "@/hooks/use-debounce";
import { useDeleteWarehouse, useWarehouses } from "../../hooks";
import type { WarehouseDto } from "../../types";

interface WarehousesTableProps {
  onCreateWarehouse: () => void;
  onEditWarehouse: (warehouse: WarehouseDto) => void;
}

export function WarehousesTable({
  onCreateWarehouse,
  onEditWarehouse,
}: WarehousesTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] =
    useState<WarehouseDto | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { toast } = useToast();
  const { mutateAsync: deleteWarehouse, isPending: isDeleting } =
    useDeleteWarehouse();

  // Fetch warehouses with sorting and filtering
  const { data, isLoading, isError } = useWarehouses({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    sortField: sorting.length > 0 ? sorting[0].id : "createdAt",
    sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "desc",
    search: debouncedSearchQuery,
  });

  const handleDeleteWarehouse = (warehouse: WarehouseDto) => {
    setWarehouseToDelete(warehouse);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (warehouseToDelete) {
        await deleteWarehouse(warehouseToDelete.id);
        setDeleteDialogOpen(false);
        setWarehouseToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      toast.error(`Failed to delete warehouse: ${error}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setWarehouseToDelete(null);
  };

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
  };

  const handlePageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize);
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

  const columns: ColumnDef<WarehouseDto>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      id: "address",
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate">
          {row.original.address || "N/A"}
        </div>
      ),
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
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
      id: "updatedAt",
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          {getSortIcon(column)}
        </Button>
      ),
      cell: ({ row }) => (
        <div>{format(new Date(row.original.updatedAt), "MMM d, yyyy")}</div>
      ),
      sortingFn: "datetime",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEditWarehouse(row.original)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteWarehouse(row.original)}
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
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 w-full max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <Button onClick={onCreateWarehouse} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Warehouse
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
                  Error loading warehouses
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No warehouses found
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the warehouse "
              {warehouseToDelete?.name}". This action cannot be undone.
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
