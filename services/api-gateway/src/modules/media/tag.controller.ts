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
} from 'nest-shared/contracts';

@Controller('media/tags')
export class TagController {
  private readonly logger = new Logger(TagController.name);

  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTags(@Query() query: TagQueryDto, @Request() req) {
    this.logger.log('Getting tags');
    return this.mediaService.getTags(query, req.headers);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTag(@Body() tagData: CreateTagDto, @Request() req) {
    this.logger.log(`Creating tag with name: ${tagData.name}`);
    return this.mediaService.createTag(tagData, req.headers);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTagById(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Getting tag with id: ${id}`);
    return this.mediaService.getTagById(id, req.headers);
  }

  @Get(':id/media')
  @UseGuards(JwtAuthGuard)
  async getMediaWithTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    this.logger.log(`Getting media with tag id: ${id}`);
    return this.mediaService.getMediaWithTag(id, req.headers);
  }

  @Get('media/:mediaId')
  @UseGuards(JwtAuthGuard)
  async getTagsForMedia(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Request() req,
  ) {
    this.logger.log(`Getting tags for media with id: ${mediaId}`);
    return this.mediaService.getTagsForMedia(mediaId, req.headers);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateData: UpdateTagDto,
    @Request() req,
  ) {
    this.logger.log(`Updating tag with id: ${id}`);
    return this.mediaService.updateTag(id, updateData, req.headers);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteTag(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    this.logger.log(`Deleting tag with id: ${id}`);
    return this.mediaService.deleteTag(id, req.headers);
  }

  @Post('add-to-media')
  @UseGuards(JwtAuthGuard)
  async addTagsToMedia(@Body() addTagsData: AddTagsToMediaDto, @Request() req) {
    this.logger.log('Adding tags to media');
    return this.mediaService.addTagsToMedia(addTagsData, req.headers);
  }

  @Post('remove-from-media')
  @UseGuards(JwtAuthGuard)
  async removeTagsFromMedia(
    @Body() removeTagsData: AddTagsToMediaDto,
    @Request() req,
  ) {
    this.logger.log('Removing tags from media');
    return this.mediaService.removeTagsFromMedia(removeTagsData, req.headers);
  }
}
