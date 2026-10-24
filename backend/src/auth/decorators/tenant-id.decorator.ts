import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator trích xuất mã ID Chi nhánh y tế (Tenant ID) đã được xác thực và cô lập
 */
export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | null => {
    const request = ctx.switchToHttp().getRequest();

    // 1. Lấy từ request.tenantId (được TenantIsolationGuard gán an toàn)
    if (request.tenantId) {
      return request.tenantId;
    }

    // 2. Lấy từ thông tin người dùng đăng nhập
    if (request.user?.tenantId) {
      return request.user.tenantId;
    }

    // 3. Dự phòng cho Super Admin chỉ định chi nhánh qua params hoặc query
    return request.params?.tenantId || request.query?.tenantId || null;
  },
);
