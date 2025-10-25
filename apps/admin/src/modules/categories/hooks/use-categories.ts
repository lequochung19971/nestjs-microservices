import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient, type ApiSchema } from '@/http-clients';
import type { FetchResponse } from 'openapi-fetch';

// Types based on the API schema
type CategoryDto = ApiSchema['CategoryDto'];
type CreateCategoryDto = ApiSchema['CreateCategoryDto'];
type UpdateCategoryDto = ApiSchema['UpdateCategoryDto'];
type QueryCategoryResponse = ApiSchema['QueryCategoryResponse'];

// Query keys for categories
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// Query parameters interface
interface CategoryQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  parentId?: string;
  flat?: boolean;
}

/**
 * Hook to fetch all categories with optional filtering and pagination
 */
export function useCategoriesQuery(params: CategoryQueryParams = {}) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: async (): Promise<QueryCategoryResponse> => {
      const client = httpClient();

      try {
        const response = await client.GET('/api/categories', {
          params: {
            query: params,
          },
        });

        return response.data!;
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch categories');
      }
    },
  });
}

/**
 * Hook to fetch a single category by ID
 */
export function useCategoryQuery(id: string | undefined) {
  return useQuery({
    queryKey: categoryKeys.detail(id!),
    queryFn: async (): Promise<CategoryDto> => {
      const client = httpClient();

      try {
        const response = await client.GET('/api/categories/{id}', {
          params: {
            path: { id: id! },
          },
        });

        const data = response.data;

        if (!data) {
          throw new Error('No data received');
        }

        return data;
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to fetch category');
      }
    },
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new category
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryDto): Promise<CategoryDto> => {
      const client = httpClient();

      try {
        const response = await client.POST('/api/categories', {
          body: data,
        });

        const responseData = response.data as any;

        if (!responseData) {
          throw new Error('No data received');
        }

        return responseData as CategoryDto;
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to create category');
      }
    },
    onSuccess: (newCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      // Add the new category to the cache
      queryClient.setQueryData(categoryKeys.detail(newCategory.id), newCategory);
    },
  });
}

/**
 * Hook to update an existing category
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryDto;
    }): Promise<CategoryDto> => {
      const client = httpClient();

      try {
        const response = await client.PATCH('/api/categories/{id}', {
          params: {
            path: { id },
          },
          body: data,
        });

        const responseData = response.data as any;

        if (!responseData) {
          throw new Error('No data received');
        }

        return responseData as CategoryDto;
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to update category');
      }
    },
    onSuccess: (updatedCategory) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      // Update the category in the cache
      queryClient.setQueryData(categoryKeys.detail(updatedCategory.id), updatedCategory);
    },
  });
}

/**
 * Hook to delete a category
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const client = httpClient();

      try {
        await client.DELETE('/api/categories/{id}', {
          params: {
            path: { id },
          },
        });
      } catch (error: any) {
        throw new Error(error?.message || 'Failed to delete category');
      }
    },
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch categories list
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });

      // Remove the deleted category from the cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) });
    },
  });
}

/**
 * Hook to fetch categories in a hierarchical tree structure
 */
export function useCategoriesTreeQuery(params: Omit<CategoryQueryParams, 'flat'> = {}) {
  return useCategoriesQuery({ ...params, flat: false });
}

/**
 * Hook to fetch categories in a flat list structure
 */
export function useCategoriesFlatQuery(params: Omit<CategoryQueryParams, 'flat'> = {}) {
  return useCategoriesQuery({ ...params, flat: true });
}

/**
 * Hook to fetch child categories for a specific parent category
 */
export function useChildCategoriesQuery(
  parentId: string | undefined,
  params: CategoryQueryParams = {}
) {
  return useCategoriesQuery({
    ...params,
    parentId,
  });
}
