import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';

@Injectable()
export class TenantIsolationGuard implements CanActivate {
  private readonly logger = new Logger(TenantIsolationGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Yêu cầu đăng nhập trước khi kiểm tra phạm vi dữ liệu chi nhánh');
    }

    // 1. Nếu là SUPER_ADMIN -> Toàn quyền truy cập mọi chi nhánh
    if (user.role === Role.SUPER_ADMIN) {
      // Cho phép Super Admin chỉ định tenantId qua params, query hoặc body (nếu có)
      const targetTenantId =
        request.params?.tenantId ||
        request.query?.tenantId ||
        request.body?.tenantId ||
        null;

      request.tenantId = targetTenantId;
      return true;
    }

    // 2. Nếu là LỄ TÂN CHI NHÁNH (BRANCH_RECEPTIONIST) -> Bắt buộc cô lập theo tenantId của tài khoản
    if (user.role === Role.BRANCH_RECEPTIONIST) {
      if (!user.tenantId) {
        throw new ForbiddenException(
          'Tài khoản Lễ tân này chưa được phân bổ vào chi nhánh y tế nào. Vui lòng liên hệ Quản trị viên.',
        );
      }

      // Kiểm tra hành vi giả mạo hoặc cố tình truy cập chi nhánh khác qua params/query/body
      const requestedTenantId =
        request.params?.tenantId ||
        request.query?.tenantId ||
        request.body?.tenantId;

      if (requestedTenantId && requestedTenantId !== user.tenantId) {
        this.logger.warn(
          `🚨 Cảnh báo bảo mật: Lễ tân [${user.email}] thuộc chi nhánh [${user.tenantId}] cố tình truy cập chi nhánh [${requestedTenantId}]!`,
        );
        throw new ForbiddenException(
          'Bạn không có quyền truy cập hoặc can thiệp dữ liệu của chi nhánh y tế khác!',
        );
      }

      // Khóa cứng request.tenantId theo đúng chi nhánh của Lễ tân
      request.tenantId = user.tenantId;
      return true;
    }

    // 3. Nhân viên nội bộ (INTERNAL_STAFF) nếu có gán tenantId
    if (user.role === Role.INTERNAL_STAFF && user.tenantId) {
      request.tenantId = user.tenantId;
      return true;
    }

    // 4. Các vai trò khác (CUSTOMER, AFFILIATE_PARTNER) không được phép vào vùng dữ liệu chi nhánh nội bộ
    this.logger.warn(
      `🚫 Từ chối truy cập: Người dùng [${user.email}] với vai trò [${user.role}] cố truy cập khu vực chi nhánh nội bộ.`,
    );
    throw new ForbiddenException('Bạn không có quyền truy cập khu vực quản lý dữ liệu chi nhánh nội bộ.');
  }
}
