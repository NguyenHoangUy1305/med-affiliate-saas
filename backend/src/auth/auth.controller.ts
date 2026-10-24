import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

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
}
