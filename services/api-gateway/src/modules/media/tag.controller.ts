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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { MediaService } from './media.service';
import {
  CreateTagDto,
  UpdateTagDto,
  TagQueryDto,
  AddTagsToMediaDto,
  TagResponseDto,
  PaginatedTagResponseDto,
  MediaResponseDto,
} from 'nest-shared/contracts';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('tags')
@Controller('media/tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class TagController {
  private readonly logger = new Logger(TagController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiQuery({ type: TagQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Tags',
    type: PaginatedTagResponseDto,
  })
  async getTags(@Query() query: TagQueryDto, @Request() req) {
    this.logger.log('Getting tags');
    return this.mediaService.getTags(query, req.headers);
  }

  @Post()
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({
    status: 201,
    description: 'Tag created',
    type: TagResponseDto,
  })
  async createTag(@Body() createTagDto: CreateTagDto, @Request() req) {
    this.logger.log(`Creating tag with name: ${createTagDto.name}`);
    return this.mediaService.createTag(createTagDto, req.headers);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Tag',
    type: TagResponseDto,
  })
  async getTagById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Getting tag with id: ${id}`);
    return this.mediaService.getTagById(id, req.headers);
  }

  @Get(':id/media')
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: 200,
    description: 'Media with tag',
    type: [MediaResponseDto],
  })
  async getMediaWithTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    this.logger.log(`Getting media with tag id: ${id}`);
    return this.mediaService.getMediaWithTag(id, req.headers);
  }

  @Get('media/:mediaId')
  @ApiParam({ name: 'mediaId', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Tags for the media item',
    type: [TagResponseDto],
  })
  async getTagsForMedia(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Request() req,
  ) {
    this.logger.log(`Getting tags for media with id: ${mediaId}`);
    return this.mediaService.getTagsForMedia(mediaId, req.headers);
  }

  @Put(':id')
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({
    status: 200,
    description: 'Tag updated',
    type: TagResponseDto,
  })
  async updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateTagDto,
    @Request() req,
  ) {
    this.logger.log(`Updating tag with id: ${id}`);
    return this.mediaService.updateTag(id, updateData, req.headers);
  }

  @Delete(':id')
  async deleteTag(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Deleting tag with id: ${id}`);
    return this.mediaService.deleteTag(id, req.headers);
  }

  @Post('add-to-media')
  @ApiBody({ type: AddTagsToMediaDto })
  @ApiResponse({
    status: 200,
    description: 'Tags added to media',
    type: TagResponseDto,
  })
  async addTagsToMedia(@Body() addTagsData: AddTagsToMediaDto, @Request() req) {
    this.logger.log('Adding tags to media');
    return this.mediaService.addTagsToMedia(addTagsData, req.headers);
  }

  @Post('remove-from-media')
  @ApiBody({ type: AddTagsToMediaDto })
  @ApiResponse({
    status: 200,
    description: 'Tags removed from media',
    type: TagResponseDto,
  })
  async removeTagsFromMedia(
    @Body() removeTagsData: AddTagsToMediaDto,
    @Request() req,
  ) {
    this.logger.log('Removing tags from media');
    return this.mediaService.removeTagsFromMedia(removeTagsData, req.headers);
  }
}
