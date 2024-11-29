import { RoleGuard } from '@/modules/role/role.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

describe('RoleGuard', () => {
  let roleGuard: RoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    roleGuard = new RoleGuard(reflector);
  });

  it('should be defined', () => {
    expect(roleGuard).toBeDefined();
  });

  it('should allow access if no roles are defined', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(undefined);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'user' } }),
      }),
      getHandler: () => {},
    } as any as ExecutionContext;
    expect(roleGuard.canActivate(context)).toBe(true);
  });

  it('should allow access if user has the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'admin' } }),
      }),
      getHandler: () => {},
    } as any as ExecutionContext;
    expect(roleGuard.canActivate(context)).toBe(true);
  });

  it('should deny access if user does not have the required role', () => {
    jest.spyOn(reflector, 'get').mockReturnValue(['admin']);
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'user' } }),
      }),
      getHandler: () => {},
    } as any as ExecutionContext;
    expect(roleGuard.canActivate(context)).toBe(false);
  });
});
