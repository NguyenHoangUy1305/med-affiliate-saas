import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Nếu endpoint không yêu cầu vai trò cụ thể -> Cho phép đi tiếp
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Yêu cầu xác thực tài khoản trước khi kiểm tra quyền');
    }

    // Kiểm tra xem vai trò của user có nằm trong danh sách được phép hay không
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Bạn không có quyền thực hiện hành động này. Yêu cầu một trong các vai trò: [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
