import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

/**
 * Composite Decorator kết hợp xác thực JWT, phân quyền RBAC và tài liệu Swagger
 * @param roles Danh sách các vai trò được phép (để trống nếu cho phép mọi user đã đăng nhập)
 */
export function Auth(...roles: Role[]) {
  if (roles.length > 0) {
    return applyDecorators(
      Roles(...roles),
      UseGuards(JwtAuthGuard, RolesGuard),
      ApiBearerAuth('JWT-auth'),
      ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc Token không hợp lệ' }),
      ApiForbiddenResponse({ description: 'Không đủ quyền truy cập tài nguyên' }),
    );
  }

  return applyDecorators(
    UseGuards(JwtAuthGuard),
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({ description: 'Chưa đăng nhập hoặc Token không hợp lệ' }),
  );
}
