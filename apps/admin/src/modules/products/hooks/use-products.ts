import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ApiSchema, httpClient } from "@/http-clients";
import type { operations } from "@/http-clients/client.generated";

export const productsKeys = {
  all: ["products"] as const,
  lists: () => [...productsKeys.all, "list"] as const,
  list: (params?: QueryProductRequest) =>
    [...productsKeys.lists(), params] as const,
  details: () => [...productsKeys.all, "detail"] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
  variants: (productId: string) =>
    [...productsKeys.all, "variants", productId] as const,
  media: (productId: string) =>
    [...productsKeys.all, "media", productId] as const,
};

type QueryProductRequest =
  operations["ProductsController_findAll"]["parameters"]["query"];
// PRODUCTS
export const useProducts = (params?: QueryProductRequest) => {
  return useQuery({
    queryKey: productsKeys.list(params),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/products", {
        params: { query: params },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await httpClient().GET("/api/products/{id}", {
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

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: ApiSchema["CreateProductDto"]) => {
      const { data, error } = await httpClient().POST("/api/products", {
        body: product,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      product,
    }: {
      id: string;
      product: ApiSchema["UpdateProductDto"];
    }) => {
      const { data, error } = await httpClient().PUT("/api/products/{id}", {
        params: { path: { id } },
        body: product,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await httpClient().DELETE("/api/products/{id}", {
        params: { path: { id } },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

// PRODUCT VARIANTS
export const useProductVariants = (productId: string) => {
  return useQuery({
    queryKey: productsKeys.variants(productId),
    queryFn: async () => {
      const { data, error } = await httpClient().GET(
        "/api/products/{id}/variants",
        {
          params: { path: { id: productId } },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!productId,
  });
};

export const useAddProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      variant,
    }: {
      productId: string;
      variant: ApiSchema["CreateProductVariantDto"];
    }) => {
      const { data, error } = await httpClient().POST(
        "/api/products/{id}/variants",
        {
          params: { path: { id: productId } },
          body: variant,
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.variants(productId),
      });
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
    },
  });
};

export const useUpdateProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
      variant,
    }: {
      productId: string;
      variantId: string;
      variant: ApiSchema["UpdateProductVariantDto"];
    }) => {
      const { data, error } = await httpClient().PUT(
        "/api/products/{id}/variants/{variantId}",
        {
          params: { path: { id: productId, variantId } },
          body: variant,
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.variants(productId),
      });
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
    },
  });
};

export const useRemoveProductVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      variantId,
    }: {
      productId: string;
      variantId: string;
    }) => {
      const { data, error } = await httpClient().DELETE(
        "/api/products/{id}/variants/{variantId}",
        {
          params: { path: { id: productId, variantId } },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.variants(productId),
      });
      queryClient.invalidateQueries({ queryKey: ["products", productId] });
    },
  });
};

// PRODUCT MEDIA
export const useProductMedia = (productId: string) => {
  return useQuery({
    queryKey: productsKeys.media(productId),
    queryFn: async () => {
      const { data, error } = await httpClient().GET(
        "/api/products/{id}/media",
        {
          params: { path: { id: productId } },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!productId,
  });
};

export const useAttachProductMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      media,
    }: {
      productId: string;
      media: ApiSchema["AttachMediaToProductDto"];
    }) => {
      const { data, error } = await httpClient().POST(
        "/api/products/{id}/media",
        {
          params: { path: { id: productId } },
          body: media,
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.media(productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsKeys.detail(productId),
      });
    },
  });
};

export const useDetachProductMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      mediaId,
    }: {
      productId: string;
      mediaId: string;
    }) => {
      const { data, error } = await httpClient().DELETE(
        "/api/products/{id}/media/{mediaId}",
        {
          params: { path: { id: productId, mediaId } },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.media(productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsKeys.detail(productId),
      });
    },
  });
};

export const useUpdatePrimaryProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      mediaId,
    }: {
      productId: string;
      mediaId: string;
    }) => {
      const { data, error } = await httpClient().PUT(
        "/api/products/{id}/media/{mediaId}/primary",
        {
          params: { path: { id: productId, mediaId } },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({
        queryKey: productsKeys.media(productId),
      });
      queryClient.invalidateQueries({
        queryKey: productsKeys.detail(productId),
      });
    },
  });
};
