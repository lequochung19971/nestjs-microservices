import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiQueryResponse,
  CreateCustomerDto,
  CustomerDto,
  QueryCustomerRequestDto,
  QueryCustomerResponseDto,
} from 'nest-shared/contracts';
import { Roles, RolesGuard } from 'nest-shared';
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
  ): Promise<CustomerDto> {
    return this.customersService.createCustomer(createCustomerDto);
  }

  @Get()
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({
    summary: 'Get all customers with pagination and filtering',
  })
  @ApiQueryResponse(CustomerDto, {
    status: HttpStatus.OK,
    description: 'Customers retrieved successfully',
  })
  async getAllCustomers(@Query() query: QueryCustomerRequestDto) {
    return this.customersService.getAllCustomers(query);
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
  async getCustomer(@Param('id') id: string): Promise<CustomerDto> {
    return this.customersService.getCustomerById(id);
  }
}
