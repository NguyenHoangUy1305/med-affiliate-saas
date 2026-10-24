import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { TenantIsolationGuard } from './tenant-isolation.guard';

describe('TenantIsolationGuard', () => {
  let guard: TenantIsolationGuard;

  beforeEach(() => {
    guard = new TenantIsolationGuard();
  });

  function createMockContext(user: any, params: any = {}, query: any = {}, body: any = {}): { context: ExecutionContext; req: any } {
    const req = { user, params, query, body, tenantId: null };
    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(req),
      }),
    } as unknown as ExecutionContext;
    return { context, req };
  }

  it('should throw UnauthorizedException if no user in request', () => {
    const { context } = createMockContext(null);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow Super Admin to access any tenant or specify tenantId', () => {
    const { context, req } = createMockContext(
      { role: Role.SUPER_ADMIN, email: 'admin@medsaas.vn' },
      { tenantId: 'tenant-long-xuyen' },
    );

    expect(guard.canActivate(context)).toBe(true);
    expect(req.tenantId).toBe('tenant-long-xuyen');
  });

  it('should automatically lock Receptionist to their assigned tenantId', () => {
    const { context, req } = createMockContext({
      role: Role.BRANCH_RECEPTIONIST,
      email: 'toan@medsaas.vn',
      tenantId: 'tenant-ag-lx',
    });

    expect(guard.canActivate(context)).toBe(true);
    expect(req.tenantId).toBe('tenant-ag-lx');
  });

  it('should throw ForbiddenException if Receptionist tries to access another branch', () => {
    const { context } = createMockContext(
      {
        role: Role.BRANCH_RECEPTIONIST,
        email: 'toan@medsaas.vn',
        tenantId: 'tenant-ag-lx',
      },
      { tenantId: 'tenant-chau-doc' }, // Cố tình truy cập Châu Đốc
    );

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if Receptionist has no tenantId assigned', () => {
    const { context } = createMockContext({
      role: Role.BRANCH_RECEPTIONIST,
      email: 'orphan@medsaas.vn',
      tenantId: null,
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should reject Customer or Affiliate Partner from accessing internal branch data', () => {
    const { context } = createMockContext({
      role: Role.CUSTOMER,
      email: 'student@agu.edu.vn',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
