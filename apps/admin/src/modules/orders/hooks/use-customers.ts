import { useQuery } from "@tanstack/react-query";
import { httpClient } from "@/http-clients";
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

export const useCustomers = (params?: QueryCustomerRequest) => {
  return useQuery({
    queryKey: customersKeys.list(params),
    queryFn: async () => {
      const response = await httpClient().GET("/api/customers", {
        params: { query: params },
      });
      if (response.error) {
        throw response.error;
      }
      return response.data;
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
