import { Role } from '@/common/enums';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/auth/role/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles) {
      // If no roles are set, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log(`>>> user`, user);
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: User role not found.');
    }

    const hasRole = roles.some((role) => role === user.role);
    if (!hasRole) {
      throw new ForbiddenException('Access denied: Insufficient permissions.');
    }

    return true;
  }
}
