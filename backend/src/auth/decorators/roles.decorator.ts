import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Decorator phân quyền theo Vai trò người dùng (Role-Based Access Control)
 * @param roles Danh sách các vai trò được phép truy cập (SUPER_ADMIN, BRANCH_RECEPTIONIST, ...)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
