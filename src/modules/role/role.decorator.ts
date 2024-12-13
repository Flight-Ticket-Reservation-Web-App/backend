import { Role } from '@/common/enums';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: [Role, ...Role[]]) =>
  SetMetadata(ROLES_KEY, roles);
