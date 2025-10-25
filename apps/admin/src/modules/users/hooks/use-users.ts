import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiSchema } from "@/http-clients";
import type { operations } from "@/http-clients/client.generated";

// Define query keys for caching
export const adminUsersKeys = {
  all: ["adminUsers"] as const,
  lists: () => [...adminUsersKeys.all, "list"] as const,
  list: (params?: AdminUsersQueryParams) =>
    [...adminUsersKeys.lists(), params] as const,
  details: () => [...adminUsersKeys.all, "detail"] as const,
  detail: (id: string) => [...adminUsersKeys.details(), id] as const,
  roles: () => [...adminUsersKeys.all, "roles"] as const,
  userRoles: (userId: string) =>
    [...adminUsersKeys.all, "userRoles", userId] as const,
};

// Types
type AdminUser = ApiSchema["AdminUserDto"];
type CreateAdminUserDto = ApiSchema["CreateAdminUserDto"];
type UpdateAdminUserDto = ApiSchema["UpdateAdminUserDto"];
type RoleAssignmentDto = ApiSchema["RoleAssignmentDto"];
type AdminUserPaginatedResponse = ApiSchema["AdminUserPaginatedResponse"];
type RolesListResponse = ApiSchema["RolesListResponse"];
type AdminUsersQueryParams =
  operations["AdminController_getAllAdmins"]["parameters"]["query"];

/**
 * Hook to fetch all admin users with pagination and filtering
 */
export const useAdminUsers = (params?: AdminUsersQueryParams) => {
  return useQuery({
    queryKey: adminUsersKeys.list(params),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/admin/users", {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data as AdminUserPaginatedResponse;
    },
  });
};

/**
 * Hook to fetch a single admin user by ID
 */
export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: adminUsersKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/admin/users/{id}", {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return data as AdminUser;
    },
    enabled: !!id,
  });
};

/**
 * Hook to create a new admin user
 */
export const useCreateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: CreateAdminUserDto) => {
      const { data, error } = await httpClient().POST("/api/admin/users", {
        body: user,
      });
      if (error) {
        throw error;
      }
      return data as AdminUser;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    },
  });
};

/**
 * Hook to update an admin user
 */
export const useUpdateAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      user,
    }: {
      id: string;
      user: UpdateAdminUserDto;
    }) => {
      const { data, error } = await httpClient().PUT("/api/admin/users/{id}", {
        params: { path: { id } },
        body: user,
      });
      if (error) {
        throw error;
      }
      return data as AdminUser;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
    },
  });
};

/**
 * Hook to delete an admin user
 */
export const useDeleteAdminUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await httpClient().DELETE("/api/admin/users/{id}", {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return { id };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.lists() });
      queryClient.removeQueries({ queryKey: adminUsersKeys.detail(id) });
    },
  });
};

/**
 * Hook to fetch all available roles
 */
export const useAdminRoles = () => {
  return useQuery({
    queryKey: adminUsersKeys.roles(),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/admin/users/roles");
      if (error) {
        throw error;
      }
      return data as RolesListResponse;
    },
  });
};

/**
 * Hook to assign roles to an admin user
 */
export const useAssignRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      roles,
    }: {
      id: string;
      roles: RoleAssignmentDto;
    }) => {
      const { error } = await httpClient().POST("/api/admin/users/{id}/roles", {
        params: { path: { id } },
        body: roles,
      });
      if (error) {
        throw error;
      }
      return { id };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.userRoles(id) });
    },
  });
};

/**
 * Hook to remove a role from an admin user
 */
export const useRemoveRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, roleName }: { id: string; roleName: string }) => {
      const { error } = await httpClient().DELETE(
        "/api/admin/users/{id}/roles/{roleName}",
        {
          params: { path: { id, roleName } },
        },
      );
      if (error) {
        throw error;
      }
      return { id, roleName };
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.userRoles(id) });
    },
  });
};
