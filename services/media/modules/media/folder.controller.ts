import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../src/guards/jwt-auth.guard';
import { FolderService } from './folder.service';
import {
  CreateFolderDto,
  UpdateFolderDto,
  FolderQueryDto,
  MoveMediaToFolderDto,
  FolderResponseDto,
  PaginatedFolderResponseDto,
  DeleteFolderResponseDto,
  MoveMediaResponseDto,
  MediaResponseDto,
} from 'nest-shared/contracts';

@ApiTags('folders')
@Controller('media/folders')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
    type: FolderResponseDto,
  })
  async createFolder(@Body() createFolderDto: CreateFolderDto, @Request() req) {
    return this.folderService.create({
      ...createFolderDto,
      ownerId: req.user.sub,
    });
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List folders with optional filtering' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter by parent folder ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by folder name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of folders',
    type: PaginatedFolderResponseDto,
  })
  async getFolders(@Query() query: FolderQueryDto, @Request() req) {
    return this.folderService.findAll({
      ...query,
      ownerId: req.user.sub,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a single folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder details',
    type: FolderResponseDto,
  })
  async getFolderById(@Param('id') id: string, @Request() req) {
    return this.folderService.findOne(id, req.user.sub);
  }

  @Get(':id/media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get media items in a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Media items in the folder',
    type: [MediaResponseDto],
  })
  async getMediaInFolder(@Param('id') id: string, @Request() req) {
    return this.folderService.getMediaInFolder(id, req.user.sub);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update folder details' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder updated successfully',
    type: FolderResponseDto,
  })
  async updateFolder(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
    @Request() req,
  ) {
    return this.folderService.update(id, updateFolderDto, req.user.sub);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a folder' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiQuery({
    name: 'deleteContents',
    required: false,
    type: Boolean,
    description: 'Whether to delete folder contents',
  })
  @ApiResponse({
    status: 200,
    description: 'Folder deleted successfully',
    type: DeleteFolderResponseDto,
  })
  async deleteFolder(
    @Param('id') id: string,
    @Query('deleteContents') deleteContents: boolean = false,
    @Request() req,
  ) {
    return this.folderService.delete(id, deleteContents, req.user.sub);
  }

  @Post('move')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Move media items to a folder' })
  @ApiResponse({
    status: 200,
    description: 'Media items moved successfully',
    type: MoveMediaResponseDto,
  })
  async moveMediaToFolder(
    @Body() moveDto: MoveMediaToFolderDto,
    @Request() req,
  ) {
    return this.folderService.moveMediaToFolder(moveDto, req.user.sub);
  }
}
