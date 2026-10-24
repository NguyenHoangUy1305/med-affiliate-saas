import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { AffiliateService } from './affiliate.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Affiliate Marketing & Mã QR')
@Controller('affiliate')
export class AffiliateController {
  constructor(private readonly affiliateService: AffiliateService) {}

  @Post('vouchers')
  @HttpCode(HttpStatus.CREATED)
  @Auth(Role.AFFILIATE_PARTNER, Role.INTERNAL_STAFF, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Tạo mã Voucher chiến dịch cá nhân (CTV / Nhân viên / Admin)',
    description: 'Tạo mã voucher gắn liền với tài khoản CTV, hệ thống tự động sinh Link giới thiệu và Mã QR Code Base64.',
  })
  @ApiResponse({ status: 201, description: 'Tạo voucher và sinh mã QR thành công' })
  @ApiResponse({ status: 409, description: 'Mã voucher đã tồn tại' })
  async createVoucher(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateVoucherDto,
  ) {
    return this.affiliateService.createVoucher(userId, dto);
  }

  @Get('my-campaigns')
  @Auth(Role.AFFILIATE_PARTNER, Role.INTERNAL_STAFF, Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Lấy danh sách các chiến dịch & Voucher cá nhân của CTV',
    description: 'Trả về toàn bộ Voucher của CTV đăng nhập, kèm thống kê số lần dùng, Link giới thiệu và ảnh QR Code Base64 để hiển thị hoặc tải về.',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách chiến dịch thành công' })
  async getMyCampaigns(@CurrentUser('id') userId: string) {
    return this.affiliateService.getMyCampaigns(userId);
  }

  @Get('voucher/:code')
  @ApiOperation({
    summary: 'Xem thông tin mã Voucher (Công khai)',
    description: 'Dành cho khách hàng kiểm tra mức giảm giá của mã voucher trước khi bấm đặt khám.',
  })
  @ApiResponse({ status: 200, description: 'Tìm thấy voucher' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy voucher' })
  async getVoucherDetails(@Param('code') code: string) {
    return this.affiliateService.getVoucherDetails(code);
  }

  @Get('generate-qr')
  @ApiOperation({
    summary: 'Công cụ sinh mã QR Code động theo chuỗi văn bản bất kỳ',
    description: 'Nhập bất kỳ đường dẫn URL hoặc chuỗi văn bản, API sẽ trả về ảnh QR Code dạng Base64 Data URL chuẩn y tế.',
  })
  @ApiQuery({ name: 'text', example: 'http://localhost:3000/packages?ref=UY_AGU50' })
  @ApiResponse({ status: 200, description: 'Sinh ảnh QR thành công' })
  async generateCustomQr(@Query('text') text: string) {
    const qrCodeBase64 = await this.affiliateService.generateQrCode(
      text || 'http://localhost:3000',
    );
    return {
      text: text || 'http://localhost:3000',
      qrCodeBase64,
    };
  }
}
