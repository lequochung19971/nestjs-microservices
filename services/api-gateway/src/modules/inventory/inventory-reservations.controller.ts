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
  CancelReservationDto,
  CreateInventoryReservationDto,
  FulfillReservationDto,
  InventoryReservationDto,
  QueryInventoryReservationRequest,
  UpdateInventoryReservationDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('inventory-reservations')
@Controller('inventory/reservations')
export class InventoryReservationsController {
  private readonly logger = new Logger(InventoryReservationsController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new inventory reservation' })
  @ApiResponse({
    status: 201,
    description: 'The inventory reservation has been successfully created',
    type: InventoryReservationDto,
  })
  async create(
    @Body() dto: CreateInventoryReservationDto,
    @Req() req: Request,
  ) {
    this.logger.log(
      `Creating inventory reservation for item: ${dto.inventoryItemId}`,
    );
    return this.inventoryService.createReservation(dto, req.headers);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory reservations' })
  @ApiQueryResponse(InventoryReservationDto, {
    status: 200,
    description: 'List of inventory reservations',
  })
  async findAll(
    @Query() query: QueryInventoryReservationRequest,
    @Req() req: Request,
  ) {
    this.logger.log(`Finding all inventory reservations`);
    return this.inventoryService.findAllReservations(query, req.headers);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory reservation by ID' })
  @ApiParam({
    name: 'id',
    description: 'Inventory Reservation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory reservation details',
    type: InventoryReservationDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory reservation not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Finding inventory reservation with id: ${id}`);
    return this.inventoryService.getReservationById(id, req.headers);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an inventory reservation' })
  @ApiParam({
    name: 'id',
    description: 'Inventory Reservation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The inventory reservation has been successfully updated',
    type: InventoryReservationDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory reservation not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryReservationDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Updating inventory reservation with id: ${id}`);
    return this.inventoryService.updateReservation(id, dto, req.headers);
  }

  @Put(':id/fulfill')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fulfill an inventory reservation' })
  @ApiParam({
    name: 'id',
    description: 'Inventory Reservation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The inventory reservation has been successfully fulfilled',
    type: InventoryReservationDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory reservation not found' })
  async fulfill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FulfillReservationDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Fulfilling inventory reservation with id: ${id}`);
    return this.inventoryService.fulfillReservation(id, dto, req.headers);
  }

  @Put(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel an inventory reservation' })
  @ApiParam({
    name: 'id',
    description: 'Inventory Reservation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The inventory reservation has been successfully cancelled',
    type: InventoryReservationDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory reservation not found' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelReservationDto,
    @Req() req: Request,
  ) {
    this.logger.log(`Cancelling inventory reservation with id: ${id}`);
    return this.inventoryService.cancelReservation(id, dto, req.headers);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete an inventory reservation' })
  @ApiParam({
    name: 'id',
    description: 'Inventory Reservation ID',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'The inventory reservation has been successfully deleted',
    type: InventoryReservationDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory reservation not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    this.logger.log(`Removing inventory reservation with id: ${id}`);
    return this.inventoryService.deleteReservation(id, req.headers);
  }

  @Post('process-expired')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process expired inventory reservations' })
  @ApiResponse({
    status: 200,
    description: 'Expired reservations processed successfully',
  })
  async processExpired(@Req() req: Request) {
    this.logger.log('Processing expired reservations');
    return this.inventoryService.processExpiredReservations(req.headers);
  }
}
