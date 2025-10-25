import { useState, useMemo, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type SortingState as TableSortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { useDebounce } from "@/hooks";
import { useAdminUsers, useDeleteAdminUser } from "./use-users";
import type { AdminUser, SortingState, FilterState } from "../types";

interface UseAdminUsersTableProps {
  onEditUser: (user: AdminUser) => void;
  onDeleteUser: (userId: string) => void;
  onManageRoles: (user: AdminUser) => void;
}

export function useAdminUsersTable(props: UseAdminUsersTableProps) {
  const { onDeleteUser } = props;
  // State for search, sorting and pagination
  const [search, setSearch] = useState<string>("");
  const [sorting, setSorting] = useState<TableSortingState>([
    { id: "username", desc: false },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounce search input
  const debouncedSearch = useDebounce(search, 300);

  // Calculate query parameters based on current state
  const queryParams = useMemo(() => {
    const sortItem = sorting[0];
    const sortDirection = sortItem?.desc ? "desc" : ("asc" as "desc" | "asc");
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearch || undefined,
      sortBy: sortItem?.id as
        | "username"
        | "email"
        | "createdTimestamp"
        | undefined,
      sortOrder: sortDirection,
    };
  }, [pagination, debouncedSearch, sorting]);

  // Fetch admin users data
  const { data: usersData, isLoading, error } = useAdminUsers(queryParams);

  // Mutation for deleting a user
  const deleteUser = useDeleteAdminUser();

  // Set up table columns
  const columns = useMemo<ColumnDef<AdminUser>[]>(
    () => [
      {
        accessorKey: "username",
        header: "Username",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        id: "name",
        header: "Name",
        cell: (info) => {
          const user = info.row.original;
          return `${user.firstName} ${user.lastName}`;
        },
      },
      {
        accessorKey: "roles",
        header: "Roles",
      },
      {
        accessorKey: "enabled",
        header: "Status",
      },
      {
        id: "actions",
        header: "",
      },
    ],
    [],
  );

  // Create filter state for role filtering
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);

  // Handle role filter click
  const handleRoleFilter = useCallback((role: string) => {
    setRoleFilter((current) => (current === role ? undefined : role));
  }, []);

  // Clear role filter
  const clearRoleFilter = useCallback(() => {
    setRoleFilter(undefined);
  }, []);

  // Set up the table instance
  const table = useReactTable({
    data: usersData?.items || [],
    columns,
    state: {
      sorting,
      pagination,
      globalFilter: debouncedSearch,
      columnFilters: roleFilter ? [{ id: "roles", value: roleFilter }] : [],
    },
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableFilters: true,
    manualPagination: true,
    pageCount: usersData ? Math.ceil(usersData.total / queryParams.limit) : 0,
    filterFns: {
      roles: (row, id, value) => {
        const roles = row.getValue(id) as string[];
        return roles.includes(value);
      },
    },
  });

  // Format pagination for the UI
  const paginationInfo = useMemo(() => {
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      totalItems: usersData?.total || 0,
      totalPages: usersData
        ? Math.ceil(usersData.total / pagination.pageSize)
        : 0,
    };
  }, [pagination, usersData]);

  // Format filter state for the UI
  const filterState = useMemo<FilterState>(() => {
    return {
      search: debouncedSearch || undefined,
      role: roleFilter,
    };
  }, [debouncedSearch, roleFilter]);

  // Format sorting state for the UI
  const sortingState = useMemo<SortingState>(() => {
    const sortItem = sorting[0];
    return {
      column: sortItem?.id || "username",
      direction: sortItem?.desc ? "desc" : "asc",
    };
  }, [sorting]);

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  return {
    table,
    data: usersData,
    isLoading,
    error,
    search,
    pagination: paginationInfo,
    sorting: sortingState,
    filters: filterState,
    roleFilter,
    handleSearchChange,
    handleRoleFilter,
    clearRoleFilter,
    deleteUser,
  };
}
