import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiSchema, httpClient } from "@/http-clients";
import type { operations } from "@/http-clients/client.generated";

export const customersKeys = {
  all: ["customers"] as const,
  lists: () => [...customersKeys.all, "list"] as const,
  list: (params?: QueryCustomerRequest) =>
    [...customersKeys.lists(), params] as const,
  details: () => [...customersKeys.all, "detail"] as const,
  detail: (id: string) => [...customersKeys.details(), id] as const,
};

type QueryCustomerRequest =
  operations["CustomersController_getAllCustomers"]["parameters"]["query"];

// CUSTOMERS
export const useCustomers = (params?: QueryCustomerRequest) => {
  return useQuery({
    queryKey: customersKeys.list(params),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/customers", {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/customers/{id}", {
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

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: ApiSchema["CreateCustomerDto"]) => {
      const { data, error } = await httpClient().POST("/api/customers", {
        body: customer,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersKeys.lists() });
    },
  });
};

