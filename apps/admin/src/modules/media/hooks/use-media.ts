import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient, type ApiSchema } from "../../../http-clients";
import { type operations } from "../../../http-clients/client.generated";

const client = httpClient();

type GetAllMediaQueryParams =
  operations["MediaController_getAllMedia"]["parameters"]["query"];

export const useGetAllMedia = (params: GetAllMediaQueryParams) => {
  return useQuery({
    queryKey: ["media", "all", params],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/media/files", {
        params: {
          query: params,
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useGetMediaById = (id: string) => {
  return useQuery({
    queryKey: ["media", id],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/media/files/{id}", {
        params: {
          path: { id },
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fileUploadDto: ApiSchema["FileUploadDto"]) => {
      const { data, error } = await client.POST("/api/media/files/upload", {
        body: fileUploadDto,
        bodySerializer: (body) => {
          const formData = new FormData();
          formData.append("file", body.file as any);
          formData.append("isPublic", body.isPublic?.toString() || "false");
          formData.append("path", body.path || "");
          formData.append("metadata", JSON.stringify(body.metadata));
          formData.append("folderId", body.folderId || "");
          return formData;
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

export const useUploadFiles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchFileUploadDto: ApiSchema["BatchFileUploadDto"]) => {
      const { data, error } = await client.POST(
        "/api/media/files/upload/batch",
        {
          body: batchFileUploadDto,
          bodySerializer: (body) => {
            const formData = new FormData();
            body.files.forEach((file) => {
              formData.append("files", file as any);
            });
            formData.append("isPublic", body.isPublic?.toString() || "false");
            formData.append("path", body.path || "");
            formData.append("folderId", body.folderId || "");
            formData.append("metadata", JSON.stringify(body.metadata));
            return formData;
          },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

export const useUpdateMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updateMediaDto,
    }: {
      id: string;
      updateMediaDto: ApiSchema["UpdateMediaDto"];
    }) => {
      const { data, error } = await client.PUT("/api/media/files/{id}", {
        params: {
          path: { id },
        },
        body: updateMediaDto,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.DELETE("/api/media/files/{id}", {
        params: {
          path: { id },
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
    },
  });
};

// Folder hooks

export type FolderResponseDto = ApiSchema["FolderResponseDto"];

type GetFoldersQueryParams =
  operations["FolderController_getFolders"]["parameters"]["query"];

export const useGetFolders = (params: GetFoldersQueryParams) => {
  return useQuery({
    queryKey: ["folders", "all", params],
    queryFn: async () => {
      const response = await client.GET("/api/media/folders", {
        params: {
          query: params,
        },
      });

      return response.data;
    },
  });
};

export const useCreateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (createFolderDto: ApiSchema["CreateFolderDto"]) => {
      const { data, error } = await client.POST("/api/media/folders", {
        body: createFolderDto,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useUpdateFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updateFolderDto,
    }: {
      id: string;
      updateFolderDto: ApiSchema["UpdateFolderDto"];
    }) => {
      const { data, error } = await client.PUT("/api/media/folders/{id}", {
        params: {
          path: { id },
        },
        body: updateFolderDto,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useDeleteFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      deleteContents,
    }: {
      id: string;
      deleteContents: boolean;
    }) => {
      const { data, error } = await client.DELETE("/api/media/folders/{id}", {
        params: {
          path: { id },
          query: { deleteContents },
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

export const useGetMediaInFolder = (id: string) => {
  return useQuery({
    queryKey: ["folders", id, "media"],
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/api/media/folders/{id}/media",
        {
          params: {
            path: { id },
          },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useMoveMediaToFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      moveMediaToFolderDto: ApiSchema["MoveMediaToFolderDto"],
    ) => {
      const { data, error } = await client.POST("/api/media/folders/move", {
        body: moveMediaToFolderDto,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });
};

// Tag hooks

type GetTagsQueryParams =
  operations["TagController_getTags"]["parameters"]["query"];

export const useGetTags = (params: GetTagsQueryParams) => {
  return useQuery({
    queryKey: ["tags", "all", params],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/media/tags", {
        params: {
          query: params,
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (createTagDto: ApiSchema["CreateTagDto"]) => {
      const { data, error } = await client.POST("/api/media/tags", {
        body: createTagDto,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updateTagDto,
    }: {
      id: string;
      updateTagDto: ApiSchema["UpdateTagDto"];
    }) => {
      const { data, error } = await client.PUT("/api/media/tags/{id}", {
        params: {
          path: { id },
        },
        body: updateTagDto,
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await client.DELETE("/api/media/tags/{id}", {
        params: {
          path: { id },
        },
      });
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

export const useGetTagsForMedia = (mediaId: string) => {
  return useQuery({
    queryKey: ["media", mediaId, "tags"],
    queryFn: async () => {
      const { data, error } = await client.GET(
        "/api/media/tags/media/{mediaId}",
        {
          params: {
            path: { mediaId },
          },
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!mediaId,
  });
};

export const useAddTagsToMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (addTagsToMediaDto: ApiSchema["AddTagsToMediaDto"]) => {
      const { data, error } = await client.POST(
        "/api/media/tags/add-to-media",
        {
          body: addTagsToMediaDto,
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      variables.mediaIds.forEach((mediaId: string) => {
        queryClient.invalidateQueries({ queryKey: ["media", mediaId, "tags"] });
      });
    },
  });
};

export const useRemoveTagsFromMedia = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      removeTagsFromMediaDto: ApiSchema["AddTagsToMediaDto"],
    ) => {
      const { data, error } = await client.POST(
        "/api/media/tags/remove-from-media",
        {
          body: removeTagsFromMediaDto,
        },
      );
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media"] });
      variables.mediaIds.forEach((mediaId: string) => {
        queryClient.invalidateQueries({ queryKey: ["media", mediaId, "tags"] });
      });
    },
  });
};
