import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Logger,
  ParseBoolPipe,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MediaService } from './media.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  FolderQueryDto,
  MoveMediaToFolderDto,
  FolderResponseDto,
  PaginatedFolderResponseDto,
} from 'nest-shared/contracts';
import { ApiQuery, ApiResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('folders')
@Controller('media/folders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class FolderController {
  private readonly logger = new Logger(FolderController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Parent folder ID',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Owner ID' })
  @ApiResponse({
    status: 200,
    description: 'List of folders',
    type: PaginatedFolderResponseDto,
  })
  async getFolders(
    @Query() query: FolderQueryDto,
    @Req() req: Request,
  ): Promise<PaginatedFolderResponseDto> {
    this.logger.log('Getting folders');
    return this.mediaService.getFolders(query, req.headers);
  }

  @Post()
  async createFolder(@Body() folderData: CreateFolderDto, @Req() req: Request) {
    this.logger.log(`Creating folder with name: ${folderData.name}`);
    return this.mediaService.createFolder(folderData, req.headers);
  }

  @Get(':id')
  async getFolderById(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Getting folder with id: ${id}`);
    return this.mediaService.getFolderById(id, req.headers);
  }

  @Get(':id/media')
  async getMediaInFolder(@Param('id') id: string, @Req() req: Request) {
    this.logger.log(`Getting media in folder with id: ${id}`);
    return this.mediaService.getMediaInFolder(id, req.headers);
  }

  @Put(':id')
  async updateFolder(
    @Param('id') id: string,
    @Body() updateData: UpdateFolderDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating folder with id: ${id}`);
    return this.mediaService.updateFolder(id, updateData, req.headers);
  }

  @Delete(':id')
  async deleteFolder(
    @Param('id') id: string,
    @Query('deleteContents', new ParseBoolPipe({ optional: true }))
    deleteContents: boolean = false,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Deleting folder with id: ${id}, deleteContents: ${deleteContents}`,
    );
    return this.mediaService.deleteFolder(id, deleteContents, req.headers);
  }

  @Post('move')
  async moveMediaToFolder(
    @Body() moveData: MoveMediaToFolderDto,
    @Req() req: Request,
  ) {
    this.logger.log('Moving media to folder');
    return this.mediaService.moveMediaToFolder(moveData, req.headers);
  }
}
