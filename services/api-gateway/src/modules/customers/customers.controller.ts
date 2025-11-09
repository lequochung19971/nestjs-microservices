import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Roles, RolesGuard } from 'nest-shared';
import {
  ApiQueryResponse,
  CreateCustomerDto,
  CustomerDto,
  QueryCustomerRequestDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CustomersService } from './customers.service';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer created successfully',
    type: CustomerDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Customer already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async createCustomer(
    @Body() createCustomerDto: CreateCustomerDto,
    @Req() req: Request,
  ): Promise<CustomerDto> {
    return this.customersService.createCustomer(createCustomerDto, req.headers);
  }

  @Get()
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({
    summary: 'Get all customers with pagination and filtering',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  @ApiQueryResponse(CustomerDto, {
    status: HttpStatus.OK,
    description: 'Customers retrieved successfully',
  })
  async getAllCustomers(
    @Query() query: QueryCustomerRequestDto,
    @Req() req: Request,
  ) {
    return this.customersService.getAllCustomers(query, req.headers);
  }

  @Get(':id')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Customer retrieved successfully',
    type: CustomerDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async getCustomer(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<CustomerDto> {
    return this.customersService.getCustomerById(id, req.headers);
  }
}
