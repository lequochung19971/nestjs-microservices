import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  BatchFileUploadDto,
  FileUploadDto,
  MediaQueryDto,
  MulterFile,
  UpdateMediaDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Body() body: FileUploadDto,
    @Request() req,
  ) {
    this.logger.log(`Uploading file: ${file.originalname}`);
    return this.mediaService.uploadFile(file, body, req.headers);
  }

  @Post('upload/batch')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles() files: any[],
    @Body() body: BatchFileUploadDto,
    @Request() req,
  ) {
    this.logger.log(`Uploading ${files.length} files`);
    return this.mediaService.uploadFiles(files, body, req.headers);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllMedia(@Query() query: MediaQueryDto, @Request() req) {
    this.logger.log('Getting all media files');
    return this.mediaService.getAllMedia(query, req.headers);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getMediaById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Getting media with id: ${id}`);
    return this.mediaService.getMediaById(id, req.headers);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateMedia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateMediaDto,
    @Request() req,
  ) {
    this.logger.log(`Updating media with id: ${id}`);
    return this.mediaService.updateMedia(id, updateData, req.headers);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMedia(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Deleting media with id: ${id}`);
    return this.mediaService.deleteMedia(id, req.headers);
  }
}
