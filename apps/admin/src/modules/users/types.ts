import type { ApiSchema } from "@/http-clients";

// User Types
export type AdminUser = ApiSchema["AdminUserDto"];
export type CreateAdminUserDto = ApiSchema["CreateAdminUserDto"];
export type UpdateAdminUserDto = ApiSchema["UpdateAdminUserDto"];
export type RoleAssignmentDto = ApiSchema["RoleAssignmentDto"];
export type AdminUserPaginatedResponse =
  ApiSchema["AdminUserPaginatedResponse"];
export type Role = ApiSchema["RoleDto"];
export type RolesListResponse = ApiSchema["RolesListResponse"];

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  offset: number;
}

// Sorting
export interface SortingState {
  column: string;
  direction: "asc" | "desc";
}

// Filtering
export interface FilterState {
  search?: string;
  role?: string;
}
