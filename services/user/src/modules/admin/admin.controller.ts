import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AdminQueryDto,
  AdminUserDto,
  AdminUserPaginatedResponse,
  CreateAdminUserDto,
  RoleAssignmentDto,
  RolesListResponse,
  UpdateAdminUserDto,
} from 'nest-shared/contracts';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { AdminService } from './admin.service';
import { Roles, RolesGuard } from 'nest-shared';

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Admin user created successfully',
    type: AdminUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  async createAdminUser(
    @Body() createAdminDto: CreateAdminUserDto,
  ): Promise<AdminUserDto> {
    return this.adminService.createAdminUser(createAdminDto);
  }

  @Get()
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin users retrieved successfully',
    type: AdminUserPaginatedResponse,
  })
  async getAllAdminUsers(
    @Query() query: AdminQueryDto,
  ): Promise<AdminUserPaginatedResponse> {
    return this.adminService.getAllAdminUsers(query);
  }

  @Get(':id')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Get admin user by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin user retrieved successfully',
    type: AdminUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin user not found',
  })
  async getAdminUserById(@Param('id') id: string): Promise<AdminUserDto> {
    return this.adminService.getAdminUserById(id);
  }

  @Put(':id')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Update admin user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin user updated successfully',
    type: AdminUserDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin user not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async updateAdminUser(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminUserDto,
  ): Promise<AdminUserDto> {
    return this.adminService.updateAdminUser(id, updateAdminDto);
  }

  @Delete(':id')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete admin user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Admin user deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Admin user not found',
  })
  async deleteAdminUser(@Param('id') id: string): Promise<void> {
    return this.adminService.deleteAdminUser(id);
  }

  @Post(':id/roles')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Assign roles to admin user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Roles assigned successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or role not found',
  })
  async assignRolesToUser(
    @Param('id') id: string,
    @Body() rolesDto: RoleAssignmentDto,
  ): Promise<void> {
    return this.adminService.assignRolesToUser(id, rolesDto.roles);
  }

  @Delete(':id/roles/:roleName')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove role from admin user' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Role removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User or role not found',
  })
  async removeRoleFromUser(
    @Param('id') id: string,
    @Param('roleName') roleName: string,
  ): Promise<void> {
    return this.adminService.removeRoleFromUser(id, roleName);
  }

  @Get('/roles')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
    type: RolesListResponse,
  })
  async getAllRoles(): Promise<RolesListResponse> {
    return this.adminService.getAllRoles();
  }
}
