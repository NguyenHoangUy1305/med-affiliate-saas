import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;       // User ID
  email: string;     // Email người dùng
  role: Role;        // Vai trò trong hệ thống (SUPER_ADMIN, AFFILIATE_PARTNER, ...)
  tenantId?: string | null; // ID chi nhánh bệnh viện (nếu là Lễ tân chi nhánh)
  iat?: number;
  exp?: number;
}
