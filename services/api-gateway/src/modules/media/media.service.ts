import { Injectable, Logger } from '@nestjs/common';
import { ApiClientService } from '../../api-clients/api-client';
import {
  BatchFileUploadDto,
  FileUploadDto,
  MulterFile,
  MediaQueryDto,
  UpdateMediaDto,
  CreateFolderDto,
  UpdateFolderDto,
  FolderQueryDto,
  MoveMediaToFolderDto,
  CreateTagDto,
  UpdateTagDto,
  TagQueryDto,
  AddTagsToMediaDto,
  RemoveTagsFromMediaDto,
} from 'nest-shared/contracts';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(private readonly apiClient: ApiClientService) {}

  // Media endpoints
  async uploadFile(
    file: MulterFile,
    body: FileUploadDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.POST('/media/upload', {
      body: {
        file,
        isPublic: body.isPublic,
        path: body.path,
        metadata: body.metadata,
      },
      headers,
    });
    return response.data;
  }

  async uploadFiles(
    files: MulterFile[],
    body: BatchFileUploadDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.POST('/media/upload/batch', {
      body: {
        files,
        isPublic: body.isPublic,
        path: body.path,
        metadata: body.metadata,
      },
      headers,
    });
    return response.data;
  }
  async getAllMedia(
    query: MediaQueryDto = {},
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.GET('/media', {
      params: { query },
      headers,
    });
    return response.data;
  }

  async getMediaById(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET('/media/{id}', {
      params: { path: { id } },
      headers,
    });
    return response.data;
  }

  async updateMedia(
    id: string,
    data: UpdateMediaDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.PUT('/media/{id}', {
      params: { path: { id } },
      body: data,
      headers,
    });
    return response.data;
  }

  async deleteMedia(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.DELETE('/media/{id}', {
      params: { path: { id } },
      headers,
    });
    return response.data;
  }

  // Folder operations
  async getFolders(
    query: FolderQueryDto = {},
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.GET('/media/folders', {
      params: { query },
      headers,
    });
    return response.data;
  }

  async createFolder(data: CreateFolderDto, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.POST('/media/folders', {
      body: data,
      headers,
    });
    return response.data;
  }

  async getFolderById(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET('/media/folders/{id}', {
      params: { path: { id } },
      headers,
    });
    return response.data;
  }

  async getMediaInFolder(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET(
      '/media/folders/{id}/media',
      {
        params: { path: { id } },
        headers,
      },
    );
    return response.data;
  }

  async updateFolder(
    id: string,
    data: UpdateFolderDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.PUT('/media/folders/{id}', {
      params: { path: { id } },
      body: data,
      headers,
    });
    return response.data;
  }

  async deleteFolder(
    id: string,
    deleteContents: boolean = false,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.DELETE('/media/folders/{id}', {
      params: {
        path: { id },
        query: { deleteContents },
      },
      headers,
    });
    return response.data;
  }

  async moveMediaToFolder(
    data: MoveMediaToFolderDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.POST('/media/folders/move', {
      body: data,
      headers,
    });
    return response.data;
  }

  // Tag operations
  async getTags(query: TagQueryDto = {}, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET('/media/tags', {
      params: { query },
      headers,
    });
    return response.data;
  }

  async createTag(data: CreateTagDto, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.POST('/media/tags', {
      body: data,
      headers,
    });
    return response.data;
  }

  async getTagById(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET('/media/tags/{id}', {
      params: { path: { id } },
      headers,
    });
    return response.data;
  }

  async getMediaWithTag(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET('/media/tags/{id}/media', {
      params: { path: { id } },
      headers,
    });
    return response.data;
  }

  async getTagsForMedia(mediaId: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.GET(
      '/media/tags/media/{mediaId}',
      {
        params: { path: { mediaId } },
        headers,
      },
    );
    return response.data;
  }

  async updateTag(
    id: string,
    data: UpdateTagDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.PUT('/media/tags/{id}', {
      params: { path: { id } },
      body: data,
      headers,
    });
    return response.data;
  }

  async deleteTag(id: string, headers: Record<string, any> = {}) {
    const response = await this.apiClient.media.DELETE('/media/tags/{id}', {
      params: { path: { id } },
      headers,
    });
    return response.data;
  }

  async addTagsToMedia(
    data: AddTagsToMediaDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.POST(
      '/media/tags/add-to-media',
      {
        body: data,
        headers,
      },
    );
    return response.data;
  }

  async removeTagsFromMedia(
    data: RemoveTagsFromMediaDto,
    headers: Record<string, any> = {},
  ) {
    const response = await this.apiClient.media.POST(
      '/media/tags/remove-from-media',
      {
        body: data,
        headers,
      },
    );
    return response.data;
  }
}
