import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiQueryResponse,
  BaseQueryResponse,
  CreateWarehouseDto,
  QueryWarehouseRequest,
  UpdateWarehouseDto,
  WarehouseDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WarehousesService } from './warehouses.service';

@ApiTags('warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({
    status: 201,
    description: 'Warehouse created successfully',
    type: WarehouseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - warehouse name already exists',
  })
  async create(
    @Body() createWarehouseDto: CreateWarehouseDto,
  ): Promise<WarehouseDto> {
    return this.warehousesService.create(createWarehouseDto);
  }

  @Get()
  @ApiOperation({ summary: 'List warehouses with filtering and pagination' })
  @ApiQuery({
    type: QueryWarehouseRequest,
  })
  @ApiQueryResponse(WarehouseDto)
  async findAll(
    @Query() query: QueryWarehouseRequest,
  ): Promise<BaseQueryResponse<WarehouseDto>> {
    return this.warehousesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse details',
    type: WarehouseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<WarehouseDto> {
    return this.warehousesService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse updated successfully',
    type: WarehouseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - warehouse name already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ): Promise<WarehouseDto> {
    return this.warehousesService.update(id, updateWarehouseDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete warehouse (soft delete)' })
  @ApiParam({ name: 'id', description: 'Warehouse ID' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse deleted successfully',
    type: WarehouseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Warehouse not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<WarehouseDto> {
    return this.warehousesService.remove(id);
  }
}
