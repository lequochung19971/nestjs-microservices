import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    // Inject your user service to fetch additional data
    // private userService: UserService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err, user): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Unauthorized access');
    }

    return {
      ...user,
      // Add additional properties as needed:
      // Example: roles from token claims
      roles: user.realm_access?.roles || [],
      // Example: normalized properties
      userId: user.sub,
      email: user.email,
      name:
        user.name ||
        `${user.given_name || ''} ${user.family_name || ''}`.trim(),
    };
  }
}
