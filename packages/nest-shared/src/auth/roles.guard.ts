import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, RolesMetadata } from './roles.decorator';
import { JwtTokenInfo } from 'nest-shared/types';
import { checkResourcesRoles } from './check-resources-roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RolesMetadata[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const { user }: { user: JwtTokenInfo } = context
      .switchToHttp()
      .getRequest();

    if (!user) {
      return false;
    }

    return checkResourcesRoles(user, requiredRoles);
  }
}
