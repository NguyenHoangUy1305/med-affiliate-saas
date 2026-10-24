import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { TenantIsolationGuard } from './guards/tenant-isolation.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { TenantId } from './decorators/tenant-id.decorator';
import { Auth } from './decorators/auth.decorator';

@ApiTags('Auth & Xác Thực Phân Quyền')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập hệ thống (Mọi Roles)',
    description: 'Xác thực tài khoản bằng Email và Mật khẩu, trả về Access Token JWT kèm thông tin quyền hạn và số dư ví.',
  })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về Access Token' })
  @ApiResponse({ status: 401, description: 'Email hoặc mật khẩu không chính xác' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register-partner')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Đăng ký tài khoản Cộng tác viên (CTV)',
    description: 'Đăng ký tài khoản CTV mới, tự động khởi tạo ngay một Ví điện tử (Wallet) số dư 0 VNĐ trong cùng một transaction.',
  })
  @ApiResponse({ status: 201, description: 'Đăng ký CTV thành công, cấp Access Token và Ví tiền' })
  @ApiResponse({ status: 409, description: 'Email hoặc số điện thoại đã tồn tại' })
  async registerPartner(@Body() dto: RegisterPartnerDto) {
    return this.authService.registerPartner(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Lấy thông tin tài khoản đang đăng nhập',
    description: 'Yêu cầu Bearer Token trong Header Authorization, trả về đầy đủ hồ sơ, chi nhánh trực thuộc và số dư ví.',
  })
  @ApiResponse({ status: 200, description: 'Lấy hồ sơ người dùng thành công' })
  @ApiResponse({ status: 401, description: 'Chưa đăng nhập hoặc token không hợp lệ' })
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  @Get('admin-check')
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: '[Demo RBAC] Kiểm tra quyền hạn SUPER_ADMIN',
    description: 'Chỉ tài khoản có vai trò SUPER_ADMIN mới được phép truy cập endpoint này.',
  })
  @ApiResponse({ status: 200, description: 'Xác thực SUPER_ADMIN thành công' })
  @ApiResponse({ status: 403, description: 'Không đủ quyền truy cập (bị RolesGuard chặn)' })
  checkAdminOnly(@CurrentUser() user: any) {
    return {
      message: 'Xin chào Quản trị viên tối cao!',
      userEmail: user.email,
      role: user.role,
      accessGranted: true,
    };
  }

  @Get('reception-check')
  @Auth(Role.BRANCH_RECEPTIONIST, Role.SUPER_ADMIN)
  @UseGuards(TenantIsolationGuard)
  @ApiOperation({
    summary: '[Demo Multi-Tenant] Kiểm tra cô lập dữ liệu Chi nhánh Lễ tân',
    description: 'Bảo vệ bởi RolesGuard và TenantIsolationGuard: tự động khóa cứng phạm vi chi nhánh theo tài khoản Lễ tân.',
  })
  @ApiResponse({ status: 200, description: 'Truy cập chi nhánh hợp lệ' })
  @ApiResponse({ status: 403, description: 'Bị từ chối do không đúng chi nhánh hoặc không có quyền' })
  checkReceptionBranch(
    @CurrentUser() user: any,
    @TenantId() tenantId: string | null,
  ) {
    return {
      message: 'Xác thực chi nhánh Lễ tân thành công!',
      userEmail: user.email,
      role: user.role,
      activeTenantId: tenantId,
      branchName: user.tenant?.name || 'Toàn quyền (Super Admin)',
    };
  }
}
