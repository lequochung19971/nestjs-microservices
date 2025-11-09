import {
  Search,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useCustomersTable } from "@/modules/customers/hooks/use-customers-table";
import {
  flexRender,
  type HeaderGroup,
  type Row,
  type Cell,
} from "@tanstack/react-table";
import type { ApiSchema } from "@/http-clients";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CustomerDto = ApiSchema["CustomerDto"];

interface CustomersTableProps {
  onViewCustomer?: (customer: CustomerDto) => void;
}

export function CustomersTable({ onViewCustomer }: CustomersTableProps) {
  const {
    table,
    data: customersData,
    isLoading,
    error,
    search,
    handleSearchChange,
    pagination,
  } = useCustomersTable({
    onViewCustomer,
  });

  const handlePageChange = (page: number) => {
    table.setPageIndex(page - 1);
  };

  const handlePageSizeChange = (pageSize: number) => {
    table.setPageSize(pageSize);
  };

  if (isLoading && (!customersData || customersData.data?.length === 0)) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load customers: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  const customers = table.getRowModel().rows;

  if (customers.length === 0 && !search) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No customers found</EmptyTitle>
          <EmptyDescription>
            Customer accounts will appear here. Create a new customer to get
            started.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

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

  return (
    <div className="space-y-4">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            placeholder="Search customers..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            autoFocus={!!search}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table
              .getHeaderGroups()
              .map((headerGroup: HeaderGroup<CustomerDto>) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={
                        header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : ""
                      }
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                        {header.column.getCanSort() &&
                          getSortIcon(header.column)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-center text-muted-foreground"
                >
                  No customers found matching "{search}"
                </TableCell>
              </TableRow>
            ) : (
              customers.map((row: Row<CustomerDto>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row
                    .getVisibleCells()
                    .map((cell: Cell<CustomerDto, unknown>) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalItems > 0 && (
        <PaginationControls
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          totalItems={pagination.totalItems}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
