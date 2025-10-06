import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Request,
  UseGuards,
  Logger,
  ParseUUIDPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MediaService } from './media.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  FolderQueryDto,
  MoveMediaToFolderDto,
} from 'nest-shared/contracts';

@Controller('media/folders')
export class FolderController {
  private readonly logger = new Logger(FolderController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFolders(@Query() query: FolderQueryDto, @Request() req) {
    this.logger.log('Getting folders');
    return this.mediaService.getFolders(query, req.headers);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createFolder(@Body() folderData: CreateFolderDto, @Request() req) {
    this.logger.log(`Creating folder with name: ${folderData.name}`);
    return this.mediaService.createFolder(folderData, req.headers);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFolderById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Getting folder with id: ${id}`);
    return this.mediaService.getFolderById(id, req.headers);
  }

  @Get(':id/media')
  @UseGuards(JwtAuthGuard)
  async getMediaInFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    this.logger.log(`Getting media in folder with id: ${id}`);
    return this.mediaService.getMediaInFolder(id, req.headers);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateFolderDto,
    @Request() req,
  ) {
    this.logger.log(`Updating folder with id: ${id}`);
    return this.mediaService.updateFolder(id, updateData, req.headers);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFolder(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('deleteContents', new ParseBoolPipe({ optional: true }))
    deleteContents: boolean = false,
    @Request() req,
  ) {
    this.logger.log(
      `Deleting folder with id: ${id}, deleteContents: ${deleteContents}`,
    );
    return this.mediaService.deleteFolder(id, deleteContents, req.headers);
  }

  @Post('move')
  @UseGuards(JwtAuthGuard)
  async moveMediaToFolder(
    @Body() moveData: MoveMediaToFolderDto,
    @Request() req,
  ) {
    this.logger.log('Moving media to folder');
    return this.mediaService.moveMediaToFolder(moveData, req.headers);
  }
}
