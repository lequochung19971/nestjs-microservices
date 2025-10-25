import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  BatchFileUploadDto,
  DeleteMediaResponseDto,
  FileUploadDto,
  MediaQueryDto,
  MediaResponseDto,
  MulterFile,
  PaginatedMediaResponseDto,
  UpdateMediaDto,
} from 'nest-shared/contracts';
import { FormDataValidationPipe } from 'nest-shared/pipes';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media/files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiResponse({
    status: 201,
    description: 'Media file uploaded successfully',
    type: MediaResponseDto,
  })
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body(new FormDataValidationPipe())
    body: FileUploadDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Uploading file: ${file.originalname}`);
    return this.mediaService.uploadFile(file, body, req.headers);
  }

  @Post('upload/batch')
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
    @UploadedFiles()
    files: Array<MulterFile>,
    @Body(new FormDataValidationPipe())
    body: BatchFileUploadDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Uploading ${files.length} files`);
    return this.mediaService.uploadFiles(files, body, req.headers);
  }

  @Get()
  @ApiQuery({ type: MediaQueryDto })
  @ApiResponse({
    status: 200,
    description: 'List of media files',
    type: PaginatedMediaResponseDto,
  })
  async getAllMedia(@Query() query: MediaQueryDto, @Req() req: Request) {
    this.logger.log('Getting all media files');
    return this.mediaService.getAllMedia(query, req.headers);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Media file by ID',
    type: MediaResponseDto,
  })
  async getMediaById(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Getting media with id: ${id}`);
    return this.mediaService.getMediaById(id, req.headers);
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateMediaDto })
  @ApiResponse({
    status: 200,
    description: 'Media file updated',
    type: MediaResponseDto,
  })
  async updateMedia(
    @Param('id') id: string,
    @Body() updateData: UpdateMediaDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating media with id: ${id}`);
    return this.mediaService.updateMedia(id, updateData, req.headers);
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({
    status: 200,
    description: 'Media file deleted',
    type: DeleteMediaResponseDto,
  })
  async deleteMedia(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Deleting media with id: ${id}`);
    return this.mediaService.deleteMedia(id, req.headers);
  }
}
