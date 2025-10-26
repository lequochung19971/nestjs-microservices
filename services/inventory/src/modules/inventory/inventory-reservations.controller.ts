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
  CancelReservationDto,
  CreateInventoryReservationDto,
  FulfillReservationDto,
  InventoryReservationDto,
  QueryInventoryReservationRequest,
  UpdateInventoryReservationDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { InventoryReservationsService } from './inventory-reservations.service';

@ApiTags('inventory-reservations')
@Controller('inventory-reservations')
export class InventoryReservationsController {
  constructor(
    private readonly inventoryReservationsService: InventoryReservationsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new inventory reservation' })
  @ApiResponse({
    status: 201,
    description: 'Inventory reservation created successfully',
    type: InventoryReservationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory item not found',
  })
  async create(
    @Body() createReservationDto: CreateInventoryReservationDto,
  ): Promise<InventoryReservationDto> {
    return this.inventoryReservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List inventory reservations with filtering and pagination',
  })
  @ApiQuery({
    type: QueryInventoryReservationRequest,
  })
  @ApiQueryResponse(InventoryReservationDto)
  async findAll(
    @Query() query: QueryInventoryReservationRequest,
  ): Promise<BaseQueryResponse<InventoryReservationDto>> {
    return this.inventoryReservationsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory reservation by ID' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation details',
    type: InventoryReservationDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryReservationDto> {
    return this.inventoryReservationsService.findOne(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update inventory reservation' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation updated successfully',
    type: InventoryReservationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed or invalid status',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateInventoryReservationDto,
  ): Promise<InventoryReservationDto> {
    return this.inventoryReservationsService.update(id, updateReservationDto);
  }

  @Put(':id/fulfill')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Fulfill inventory reservation' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation fulfilled successfully',
    type: InventoryReservationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status or expired reservation',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async fulfill(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() fulfillReservationDto: FulfillReservationDto,
  ): Promise<InventoryReservationDto> {
    return this.inventoryReservationsService.fulfill(id, fulfillReservationDto);
  }

  @Put(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel inventory reservation' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation cancelled successfully',
    type: InventoryReservationDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status',
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelReservationDto: CancelReservationDto,
  ): Promise<InventoryReservationDto> {
    return this.inventoryReservationsService.cancel(id, cancelReservationDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete inventory reservation' })
  @ApiParam({ name: 'id', description: 'Reservation ID' })
  @ApiResponse({
    status: 200,
    description: 'Reservation deleted successfully',
    type: InventoryReservationDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Reservation not found',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InventoryReservationDto> {
    return this.inventoryReservationsService.remove(id);
  }

  @Post('process-expired')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Process expired reservations' })
  @ApiResponse({
    status: 200,
    description: 'Expired reservations processed',
    schema: {
      type: 'object',
      properties: {
        processedCount: { type: 'number' },
      },
    },
  })
  async processExpiredReservations() {
    const processedCount =
      await this.inventoryReservationsService.processExpiredReservations();
    return { processedCount };
  }
}
