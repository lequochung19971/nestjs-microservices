import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/http-clients";
import { toast } from "sonner";
import { convertResponseDates } from "@/http-clients/utils";

import type {
  WarehouseDto,
  CreateWarehouseDto,
  UpdateWarehouseDto,
  InventoryItemDto,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  AdjustQuantityDto,
  InventoryTransactionDto,
  CreateInventoryTransactionDto,
  InventoryReservationDto,
  CreateInventoryReservationDto,
  UpdateInventoryReservationDto,
  FulfillReservationDto,
  CancelReservationDto,
  WarehouseQueryParams,
  InventoryItemQueryParams,
  TransactionQueryParams,
  ReservationQueryParams,
} from "../types";

// Create API client
const api = httpClient();

// Warehouse hooks
export const useWarehouses = (params: WarehouseQueryParams = {}) => {
  return useQuery({
    queryKey: ["warehouses", params],
    queryFn: async () => {
      const { data } = await api.GET("/api/inventory/warehouses", {
        params: { query: params },
      });
      return data;
    },
  });
};

export const useWarehouse = (id: string | undefined) => {
  return useQuery({
    queryKey: ["warehouse", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.GET("/api/inventory/warehouses/{id}", {
        params: { path: { id } },
      });
      return data as WarehouseDto;
    },
    enabled: !!id,
  });
};

export const useCreateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (warehouse: CreateWarehouseDto) => {
      const { data } = await api.POST("/api/inventory/warehouses", {
        body: warehouse,
      });
      return data as WarehouseDto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create warehouse: ${error.message}`);
    },
  });
};

export const useUpdateWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      warehouse,
    }: {
      id: string;
      warehouse: UpdateWarehouseDto;
    }) => {
      const { data } = await api.PUT("/api/inventory/warehouses/{id}", {
        params: { path: { id } },
        body: warehouse,
      });
      return data as WarehouseDto;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse", id] });
      toast.success("Warehouse updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update warehouse: ${error.message}`);
    },
  });
};

export const useDeleteWarehouse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.DELETE("/api/inventory/warehouses/{id}", {
        params: { path: { id } },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warehouses"] });
      toast.success("Warehouse deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete warehouse: ${error.message}`);
    },
  });
};

// Inventory Items hooks
export const useInventoryItems = (params: InventoryItemQueryParams = {}) => {
  return useQuery({
    queryKey: ["inventoryItems", params],
    queryFn: async () => {
      const { data } = await api.GET("/api/inventory/items", {
        params: { query: params },
      });
      return data;
    },
  });
};

export const useInventoryItem = (id: string | undefined) => {
  return useQuery({
    queryKey: ["inventoryItem", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.GET("/api/inventory/items/{id}", {
        params: { path: { id } },
      });
      return data as InventoryItemDto;
    },
    enabled: !!id,
  });
};

export const useInventoryItemsByWarehouse = (
  warehouseId: string | undefined,
) => {
  return useQuery({
    queryKey: ["inventoryItems", "warehouse", warehouseId],
    queryFn: async () => {
      if (!warehouseId) return [];
      const { data } = await api.GET(
        "/api/inventory/items/warehouse/{warehouseId}",
        {
          params: { path: { warehouseId } },
        },
      );
      return data as InventoryItemDto[];
    },
    enabled: !!warehouseId,
  });
};

export const useInventoryItemsByProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["inventoryItems", "product", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data } = await api.GET(
        "/api/inventory/items/product/{productId}",
        {
          params: { path: { productId } },
        },
      );
      return data as InventoryItemDto[];
    },
    enabled: !!productId,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: CreateInventoryItemDto) => {
      const { data } = await api.POST("/api/inventory/items", {
        body: item,
      });
      return data as InventoryItemDto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      if (data.warehouseId) {
        queryClient.invalidateQueries({
          queryKey: ["inventoryItems", "warehouse", data.warehouseId],
        });
      }
      toast.success("Inventory item created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create inventory item: ${error.message}`);
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      item,
    }: {
      id: string;
      item: UpdateInventoryItemDto;
    }) => {
      const { data } = await api.PUT("/api/inventory/items/{id}", {
        params: { path: { id } },
        body: item,
      });
      return data as InventoryItemDto;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItem", id] });
      if (data.warehouseId) {
        queryClient.invalidateQueries({
          queryKey: ["inventoryItems", "warehouse", data.warehouseId],
        });
      }
      toast.success("Inventory item updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update inventory item: ${error.message}`);
    },
  });
};

export const useAdjustInventoryQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      adjustment,
    }: {
      id: string;
      adjustment: AdjustQuantityDto;
    }) => {
      const { data } = await api.PUT("/api/inventory/items/{id}/quantity", {
        params: { path: { id } },
        body: adjustment,
      });
      return data as InventoryItemDto;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryItem", id] });
      if (data.warehouseId) {
        queryClient.invalidateQueries({
          queryKey: ["inventoryItems", "warehouse", data.warehouseId],
        });
      }
      toast.success("Inventory quantity adjusted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to adjust inventory quantity: ${error.message}`);
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.DELETE("/api/inventory/items/{id}", {
        params: { path: { id } },
      });
      return data as InventoryItemDto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      if (data.warehouseId) {
        queryClient.invalidateQueries({
          queryKey: ["inventoryItems", "warehouse", data.warehouseId],
        });
      }
      toast.success("Inventory item deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete inventory item: ${error.message}`);
    },
  });
};

// Transaction hooks
export const useTransactions = (params: TransactionQueryParams = {}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const { data } = await api.GET("/api/inventory/transactions", {
        params: { query: params },
      });
      return data;
    },
  });
};

export const useTransaction = (id: string | undefined) => {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.GET("/api/inventory/transactions/{id}", {
        params: { path: { id } },
      });
      return data as InventoryTransactionDto;
    },
    enabled: !!id,
  });
};

export const useTransactionsByInventoryItem = (
  inventoryItemId: string | undefined,
) => {
  return useQuery({
    queryKey: ["transactions", "inventoryItem", inventoryItemId],
    queryFn: async () => {
      if (!inventoryItemId) return [];
      const { data } = await api.GET(
        "/api/inventory/transactions/inventory-item/{inventoryItemId}",
        {
          params: { path: { inventoryItemId } },
        },
      );
      return data as InventoryTransactionDto[];
    },
    enabled: !!inventoryItemId,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: CreateInventoryTransactionDto) => {
      const { data } = await api.POST("/api/inventory/transactions", {
        body: transaction,
      });
      return data as InventoryTransactionDto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transactions", "inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({
        queryKey: ["inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Transaction recorded successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to record transaction: ${error.message}`);
    },
  });
};

// Reservation hooks
export const useReservations = (params: ReservationQueryParams = {}) => {
  return useQuery({
    queryKey: ["reservations", params],
    queryFn: async () => {
      const { data } = await api.GET("/api/inventory/reservations", {
        params: { query: params },
      });
      return data;
    },
  });
};

export const useReservation = (id: string | undefined) => {
  return useQuery({
    queryKey: ["reservation", id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.GET("/api/inventory/reservations/{id}", {
        params: { path: { id } },
      });
      return data as InventoryReservationDto;
    },
    enabled: !!id,
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reservation: CreateInventoryReservationDto) => {
      const { data } = await api.POST("/api/inventory/reservations", {
        body: reservation,
      });
      return data as InventoryReservationDto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Inventory reservation created successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to create reservation: ${error.message}`);
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      reservation,
    }: {
      id: string;
      reservation: UpdateInventoryReservationDto;
    }) => {
      const { data } = await api.PUT("/api/inventory/reservations/{id}", {
        params: { path: { id } },
        body: reservation,
      });
      return data as InventoryReservationDto;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Reservation updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update reservation: ${error.message}`);
    },
  });
};

export const useFulfillReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      fulfillmentData,
    }: {
      id: string;
      fulfillmentData: FulfillReservationDto;
    }) => {
      const { data } = await api.PUT(
        "/api/inventory/reservations/{id}/fulfill",
        {
          params: { path: { id } },
          body: fulfillmentData,
        },
      );
      return data as InventoryReservationDto;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Reservation fulfilled successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to fulfill reservation: ${error.message}`);
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      cancellationData,
    }: {
      id: string;
      cancellationData: CancelReservationDto;
    }) => {
      const { data } = await api.PUT(
        "/api/inventory/reservations/{id}/cancel",
        {
          params: { path: { id } },
          body: cancellationData,
        },
      );
      return data as InventoryReservationDto;
    },
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["reservation", id] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Reservation cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel reservation: ${error.message}`);
    },
  });
};

export const useDeleteReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.DELETE("/api/inventory/reservations/{id}", {
        params: { path: { id } },
      });
      return data as InventoryReservationDto;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["inventoryItem", data.inventoryItemId],
      });
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      toast.success("Reservation deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete reservation: ${error.message}`);
    },
  });
};
