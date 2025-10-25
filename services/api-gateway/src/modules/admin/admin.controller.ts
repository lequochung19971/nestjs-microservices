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
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
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
    description: 'Admin user successfully created',
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async createAdmin(
    @Body() createAdminDto: CreateAdminUserDto,
    @Req() req: Request,
  ) {
    return this.adminService.createAdmin(createAdminDto, req.headers);
  }

  @Get()
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({
    summary: 'Get all admin users with pagination and filtering',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Admin users retrieved successfully',
    type: AdminUserPaginatedResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async getAllAdmins(@Query() query: AdminQueryDto, @Req() req: Request) {
    return this.adminService.getAllAdmins(query, req.headers);
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async getAdmin(@Param('id') id: string, @Req() req: Request) {
    return this.adminService.getAdminById(id, req.headers);
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async updateAdmin(
    @Param('id') id: string,
    @Body() updateAdminDto: UpdateAdminUserDto,
    @Req() req: Request,
  ) {
    return this.adminService.updateAdmin(id, updateAdminDto, req.headers);
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
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async deleteAdmin(@Param('id') id: string, @Req() req: Request) {
    await this.adminService.deleteAdmin(id, req.headers);
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
    description: 'Admin user or role not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async assignRoles(
    @Param('id') id: string,
    @Body() rolesDto: RoleAssignmentDto,
    @Req() req: Request,
  ) {
    await this.adminService.assignRoles(id, rolesDto.roles, req.headers);
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
    description: 'Admin user or role not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async removeRole(
    @Param('id') id: string,
    @Param('roleName') roleName: string,
    @Req() req: Request,
  ) {
    await this.adminService.removeRole(id, roleName, req.headers);
  }

  @Get('/roles')
  @Roles({ resource: 'admin-client', roles: ['admin'] })
  @ApiOperation({ summary: 'Get all available roles' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Roles retrieved successfully',
    type: RolesListResponse,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - requires admin role',
  })
  async getAllRoles(@Req() req: Request) {
    return this.adminService.getAllRoles(req.headers);
  }
}
