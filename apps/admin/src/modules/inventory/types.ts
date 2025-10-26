import type { ApiSchema } from "@/http-clients";

// Export types for convenience
export type WarehouseDto = ApiSchema["WarehouseDto"];
export type CreateWarehouseDto = ApiSchema["CreateWarehouseDto"];
export type UpdateWarehouseDto = ApiSchema["UpdateWarehouseDto"];

export type InventoryItemDto = ApiSchema["InventoryItemDto"];
export type CreateInventoryItemDto = ApiSchema["CreateInventoryItemDto"];
export type UpdateInventoryItemDto = ApiSchema["UpdateInventoryItemDto"];
export type AdjustQuantityDto = ApiSchema["AdjustQuantityDto"];

export type InventoryTransactionDto = ApiSchema["InventoryTransactionDto"];
export type CreateInventoryTransactionDto =
  ApiSchema["CreateInventoryTransactionDto"];

export type InventoryReservationDto = ApiSchema["InventoryReservationDto"];
export type CreateInventoryReservationDto =
  ApiSchema["CreateInventoryReservationDto"];
export type UpdateInventoryReservationDto =
  ApiSchema["UpdateInventoryReservationDto"];
export type FulfillReservationDto = ApiSchema["FulfillReservationDto"];
export type CancelReservationDto = ApiSchema["CancelReservationDto"];

// Pagination interfaces
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface SortingParams {
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  isActive?: boolean;
}

// Query params for warehouses
export interface WarehouseQueryParams
  extends PaginationParams,
    SortingParams,
    FilterParams {}

export type InventoryStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "SOLD"
  | "DAMAGED"
  | "RETURNED";

// Query params for inventory items
export interface InventoryItemQueryParams
  extends PaginationParams,
    SortingParams {
  warehouseId?: string;
  productId?: string;
  status?: InventoryStatus;
  lowStock?: boolean;
  outOfStock?: boolean;
}

export type TransactionType =
  | "PURCHASE"
  | "SALE"
  | "RETURN"
  | "ADJUSTMENT"
  | "TRANSFER";

// Query params for transactions
export interface TransactionQueryParams
  extends PaginationParams,
    SortingParams {
  inventoryItemId?: string;
  type?: TransactionType;
  referenceId?: string;
  referenceType?: string;
  startDate?: string;
  endDate?: string;
}

export type ReservationStatus =
  | "ACTIVE"
  | "FULFILLED"
  | "CANCELLED"
  | "EXPIRED";
// Query params for reservations
export interface ReservationQueryParams
  extends PaginationParams,
    SortingParams {
  inventoryItemId?: string;
  orderId?: string;
  status?: ReservationStatus;
  expired?: boolean;
}
