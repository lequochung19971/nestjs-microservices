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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  ApiQueryResponse,
  CreateWarehouseDto,
  QueryWarehouseRequest,
  UpdateWarehouseDto,
  WarehouseDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('inventory-warehouses')
@Controller('inventory/warehouses')
export class WarehousesController {
  private readonly logger = new Logger(WarehousesController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({
    status: 201,
    description: 'The warehouse has been successfully created',
    type: WarehouseDto,
  })
  async create(@Body() dto: CreateWarehouseDto, @Req() req: Request) {
    this.logger.log(`Creating warehouse: ${dto.name}`);
    return this.inventoryService.createWarehouse(dto, req.headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get all warehouses' })
  @ApiQueryResponse(WarehouseDto, {
    status: 200,
    description: 'List of warehouses',
  })
  async findAll(@Query() query: QueryWarehouseRequest, @Req() req: Request) {
    this.logger.log(`Finding all warehouses`);
    return this.inventoryService.findAllWarehouses(query, req.headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a warehouse by ID' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse details',
    type: WarehouseDto,
  })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Finding warehouse with id: ${id}`);
    return this.inventoryService.getWarehouseById(id, req.headers);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The warehouse has been successfully updated',
    type: WarehouseDto,
  })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWarehouseDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating warehouse with id: ${id}`);
    return this.inventoryService.updateWarehouse(id, dto, req.headers);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a warehouse' })
  @ApiParam({ name: 'id', description: 'Warehouse ID', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'The warehouse has been successfully deleted',
    type: WarehouseDto,
  })
  @ApiResponse({ status: 404, description: 'Warehouse not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Removing warehouse with id: ${id}`);
    return this.inventoryService.deleteWarehouse(id, req.headers);
  }
}
