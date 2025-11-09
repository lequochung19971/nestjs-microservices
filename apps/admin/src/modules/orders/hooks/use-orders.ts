import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiSchema, httpClient } from "@/http-clients";
import type { operations } from "@/http-clients/client.generated";

export const ordersKeys = {
  all: ["orders"] as const,
  lists: () => [...ordersKeys.all, "list"] as const,
  list: (params?: QueryOrderRequest) =>
    [...ordersKeys.lists(), params] as const,
  details: () => [...ordersKeys.all, "detail"] as const,
  detail: (id: string) => [...ordersKeys.details(), id] as const,
};

type QueryOrderRequest =
  operations["OrdersController_findAll"]["parameters"]["query"];

// ORDERS
export const useOrders = (params?: QueryOrderRequest) => {
  return useQuery({
    queryKey: ordersKeys.list(params),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/orders", {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ordersKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/orders/{id}", {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: ApiSchema["CreateOrderDto"]) => {
      const { data, error } = await httpClient().POST("/api/orders", {
        body: order,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
  });
};

export const useCreateOrderAsAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: ApiSchema["CreateOrderDto"]) => {
      const { data, error } = await httpClient().POST(
        "/api/orders/admin/create",
        {
          body: order,
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      order,
    }: {
      id: string;
      order: ApiSchema["UpdateOrderDto"];
    }) => {
      const { data, error } = await httpClient().PUT("/api/orders/{id}", {
        params: { path: { id } },
        body: order,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; reason?: string }) => {
      const { data, error } = await httpClient().POST(
        "/api/orders/{id}/cancel",
        {
          params: { path: { id } },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ordersKeys.lists() });
    },
  });
};
