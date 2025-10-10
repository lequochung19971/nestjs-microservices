import {
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  BatchFileUploadDto,
  DeleteMediaResponseDto,
  FileUploadDto,
  GetMediaByIdsDto,
  MediaQueryDto,
  MediaResponseDto,
  PaginatedMediaResponseDto,
  UpdateMediaDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { MediaService } from './media.service';
import { Request } from 'express';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload a single media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({
    status: 201,
    description: 'Media file uploaded successfully',
    type: MediaResponseDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100 * 1024 * 1024 }), // 100MB max file size
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() body: { isPublic?: string; path?: string; metadata?: string },
    @Req() req: Request,
  ) {
    const isPublic = body.isPublic === 'true';
    const path = body.path || '';
    const metadata = body.metadata ? JSON.parse(body.metadata) : {};

    return this.mediaService.create({
      file,
      ownerId: req.user?.sub,
      isPublic,
      metadata,
      path,
    });
  }

  @Post('upload/batch')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload multiple media files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: BatchFileUploadDto })
  @ApiResponse({
    status: 201,
    description: 'Media files uploaded successfully',
    type: [MediaResponseDto],
  })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  async uploadFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 50 * 1024 * 1024 }), // 50MB per file
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() body: { isPublic?: string; path?: string; metadata?: string },
    @Req() req: Request,
  ) {
    const isPublic = body.isPublic === 'true';
    const path = body.path || '';
    const metadata = body.metadata ? JSON.parse(body.metadata) : {};

    const uploadPromises = files.map((file) =>
      this.mediaService.create({
        file,
        ownerId: req.user.sub,
        isPublic,
        metadata,
        path,
      }),
    );

    return Promise.all(uploadPromises);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all media files (with pagination and filtering)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of media files',
    type: PaginatedMediaResponseDto,
  })
  async getAllMedia(@Query() query: MediaQueryDto, @Req() req: Request) {
    // Add owner ID to query for user-specific media
    return this.mediaService.findAll({
      ...query,
      ownerId: req.user.sub,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media file by ID' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Media file details',
    type: MediaResponseDto,
  })
  async getMediaById(@Param('id') id: string, @Req() req: Request) {
    const media = await this.mediaService.findOne(id);

    // Check if media is public or belongs to the requesting user
    if (!media.isPublic && (!req.user || req.user.sub !== media.ownerId)) {
      // For non-public media, ensure the user is authenticated and is the owner
      throw new Error('Access denied');
    }

    return media;
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Media updated successfully',
    type: MediaResponseDto,
  })
  async updateMedia(
    @Param('id') id: string,
    @Body() updateData: UpdateMediaDto,
    @Req() req: Request,
  ) {
    return this.mediaService.update(id, updateData, req.user.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete media' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Media deleted successfully',
    type: DeleteMediaResponseDto,
  })
  async deleteMedia(@Param('id') id: string, @Req() req: Request) {
    return this.mediaService.delete(id, req.user.sub);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get media by IDs' })
  @ApiResponse({
    status: 200,
    description: 'Media by IDs',
    type: [MediaResponseDto],
  })
  async getMediaByIds(@Body() body: GetMediaByIdsDto) {
    return this.mediaService.findByIds(body.ids);
  }
}
