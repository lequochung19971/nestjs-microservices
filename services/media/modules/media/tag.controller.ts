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
import { TagService } from './tag.service';
import {
  CreateTagDto,
  UpdateTagDto,
  TagQueryDto,
  AddTagsToMediaDto,
  TagResponseDto,
  PaginatedTagResponseDto,
  DeleteTagResponseDto,
  TagOperationResponseDto,
  MediaResponseDto,
  RemoveTagsFromMediaDto,
} from 'nest-shared/contracts';

@ApiTags('tags')
@Controller('media/tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({
    status: 201,
    description: 'Tag created successfully',
    type: TagResponseDto,
  })
  async createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'List tags with optional filtering' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by tag name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (1-based)',
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of tags',
    type: PaginatedTagResponseDto,
  })
  async getTags(@Query() query: TagQueryDto) {
    return this.tagService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag details',
    type: TagResponseDto,
  })
  async getTagById(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Get(':id/media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get media items with a specific tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Media items with the tag',
    type: [MediaResponseDto],
  })
  async getMediaWithTag(@Param('id') id: string, @Request() req) {
    return this.tagService.getMediaWithTag(id, req.user.sub);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update tag details' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag updated successfully',
    type: TagResponseDto,
  })
  async updateTag(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag deleted successfully',
    type: DeleteTagResponseDto,
  })
  async deleteTag(@Param('id') id: string) {
    return this.tagService.delete(id);
  }

  @Get('media/:mediaId')
  @ApiOperation({ summary: 'Get tags for a specific media item' })
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Tags for the media item',
    type: [TagResponseDto],
  })
  async getTagsForMedia(@Param('mediaId') mediaId: string) {
    return this.tagService.getTagsForMedia(mediaId);
  }

  @Post('add-to-media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add tags to media items' })
  @ApiResponse({
    status: 200,
    description: 'Tags added to media items',
    type: TagOperationResponseDto,
  })
  async addTagsToMedia(@Body() addTagsDto: AddTagsToMediaDto, @Request() req) {
    return this.tagService.addTagsToMedia(addTagsDto, req.user.sub);
  }

  @Post('remove-from-media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Remove tags from media items' })
  @ApiResponse({
    status: 200,
    description: 'Tags removed from media items',
    type: TagOperationResponseDto,
  })
  async removeTagsFromMedia(
    @Body() removeTagsDto: RemoveTagsFromMediaDto,
    @Request() req,
  ) {
    return this.tagService.removeTagsFromMedia(removeTagsDto, req.user.sub);
  }
}
