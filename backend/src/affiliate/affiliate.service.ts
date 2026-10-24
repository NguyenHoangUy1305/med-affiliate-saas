import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { ValidateVoucherDto } from './dto/validate-voucher.dto';

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  /**
   * Tạo mã Voucher cá nhân cho Cộng tác viên (CTV)
   */
  async createVoucher(userId: string, dto: CreateVoucherDto) {
    const normalizedCode = dto.code.toUpperCase().trim();

    // 1. Kiểm tra chống trùng mã voucher
    const existing = await this.prisma.voucher.findUnique({
      where: { code: normalizedCode },
    });
    if (existing) {
      throw new ConflictException(`Mã Voucher [${normalizedCode}] đã tồn tại trong hệ thống. Vui lòng chọn mã khác.`);
    }

    // 2. Tạo bản ghi voucher trong CSDL
    const voucher = await this.prisma.voucher.create({
      data: {
        affiliateUserId: userId,
        code: normalizedCode,
        discountValue: new Prisma.Decimal(dto.discountValue),
        maxUsage: dto.maxUsage || 100,
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        isActive: true,
      },
    });

    this.logger.log(`🏷️ CTV [${userId}] đã tạo voucher mới: [${voucher.code}] (-${voucher.discountValue}đ)`);

    // 3. Tự động sinh Link giới thiệu và Mã QR
    const trackingUrl = `${this.frontendUrl}/packages?ref=${voucher.code}`;
    const qrCodeBase64 = await this.generateQrCode(trackingUrl);

    return {
      message: 'Tạo mã Voucher chiến dịch thành công',
      voucher,
      trackingUrl,
      qrCodeBase64,
    };
  }

  /**
   * Lấy danh sách các chiến dịch & Voucher cá nhân của CTV đang đăng nhập
   * Kèm Link giới thiệu và Ảnh QR Code Base64 để hiển thị hoặc tải về
   */
  async getMyCampaigns(userId: string) {
    const vouchers = await this.prisma.voucher.findMany({
      where: { affiliateUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    const campaigns = await Promise.all(
      vouchers.map(async (v) => {
        const trackingUrl = `${this.frontendUrl}/packages?ref=${v.code}`;
        const qrCodeBase64 = await this.generateQrCode(trackingUrl);

        return {
          id: v.id,
          code: v.code,
          discountValue: Number(v.discountValue),
          maxUsage: v.maxUsage,
          usedCount: v.usedCount,
          remainingUsage: Math.max(0, v.maxUsage - v.usedCount),
          expiryDate: v.expiryDate,
          isActive: v.isActive,
          ordersCount: v._count.orders,
          trackingUrl,
          qrCodeBase64,
          createdAt: v.createdAt,
        };
      }),
    );

    return {
      totalCampaigns: campaigns.length,
      campaigns,
    };
  }

  /**
   * Xem thông tin chi tiết của 1 voucher theo code (công khai khi khách nhập mã giảm giá)
   */
  async getVoucherDetails(code: string) {
    const normalizedCode = code.toUpperCase().trim();
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: normalizedCode },
      include: {
        affiliateUser: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Không tìm thấy mã Voucher [${normalizedCode}]`);
    }

    return {
      code: voucher.code,
      discountValue: Number(voucher.discountValue),
      isActive: voucher.isActive,
      isExpired: voucher.expiryDate ? new Date() > voucher.expiryDate : false,
      isOutOfUsage: voucher.usedCount >= voucher.maxUsage,
      affiliatePartner: {
        id: voucher.affiliateUser.id,
        name: voucher.affiliateUser.fullName,
      },
    };
  }

  /**
   * Cơ chế Chống Gian lận (Anti-Fraud Engine):
   * Xác thực mã giảm giá, kiểm tra thời hạn, lượt dùng, chống tự giới thiệu (Self-referral) và điều kiện sinh viên AGU.
   */
  async validateVoucher(dto: ValidateVoucherDto) {
    const normalizedCode = dto.voucherCode.toUpperCase().trim();
    const normalizedPhone = dto.customerPhone.trim();
    const normalizedEmail = dto.customerEmail?.toLowerCase().trim();

    // 1. Kiểm tra tồn tại Voucher
    const voucher = await this.prisma.voucher.findUnique({
      where: { code: normalizedCode },
      include: {
        affiliateUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Mã giảm giá [${normalizedCode}] không tồn tại.`);
    }

    // 2. Kiểm tra trạng thái hoạt động của Voucher
    if (!voucher.isActive) {
      throw new BadRequestException(`Mã giảm giá [${normalizedCode}] hiện đang tạm ngưng áp dụng.`);
    }

    // 3. Kiểm tra hạn sử dụng
    if (voucher.expiryDate && new Date() > voucher.expiryDate) {
      throw new BadRequestException(
        `Mã giảm giá [${normalizedCode}] đã hết hạn sử dụng vào ngày ${voucher.expiryDate.toISOString().split('T')[0]}.`,
      );
    }

    // 4. Kiểm tra giới hạn số lượt sử dụng
    if (voucher.usedCount >= voucher.maxUsage) {
      throw new BadRequestException(
        `Mã giảm giá [${normalizedCode}] đã đạt giới hạn sử dụng tối đa (${voucher.maxUsage}/${voucher.maxUsage} lượt).`,
      );
    }

    // 5. Kiểm tra phòng chống Tự giới thiệu (Self-referral Prevention)
    // CTV không được dùng chính voucher của mình để đặt khám hưởng hoa hồng
    const affiliatePhone = voucher.affiliateUser.phone?.trim();
    const affiliateEmail = voucher.affiliateUser.email?.toLowerCase().trim();

    if (
      normalizedPhone === affiliatePhone ||
      (normalizedEmail && affiliateEmail && normalizedEmail === affiliateEmail)
    ) {
      this.logger.warn(
        `🚨 Phát hiện gian lận Self-referral: Người đặt khám [Phone: ${normalizedPhone}, Email: ${normalizedEmail}] trùng với CTV sở hữu voucher [${voucher.code}]!`,
      );
      throw new BadRequestException(
        `Chính sách chống gian lận: Bạn không thể áp dụng mã giới thiệu của chính mình để trục lợi hoa hồng!`,
      );
    }

    // 6. Kiểm tra gói khám y tế tương ứng
    const medicalPackage = await this.prisma.medicalPackage.findUnique({
      where: { id: dto.packageId },
    });

    if (!medicalPackage) {
      throw new NotFoundException(`Gói khám y tế không tồn tại.`);
    }

    if (!medicalPackage.isActive) {
      throw new BadRequestException(`Gói khám [${medicalPackage.name}] hiện đang tạm ngưng nhận đặt hẹn.`);
    }

    // 7. Kiểm tra đối tượng thụ hưởng (Target Audience): Sinh viên AGU
    if (medicalPackage.targetAudience === 'STUDENT_ONLY') {
      if (!normalizedEmail || !normalizedEmail.endsWith('@agu.edu.vn')) {
        this.logger.warn(
          `🚫 Từ chối kích hoạt gói sinh viên: Email [${normalizedEmail || 'N/A'}] không thuộc tên miền trường @agu.edu.vn`,
        );
        throw new BadRequestException(
          `Gói khám [${medicalPackage.name}] là gói ưu đãi đặc quyền dành riêng cho sinh viên Đại học An Giang. Vui lòng cung cấp email sinh viên hợp lệ (@agu.edu.vn) để xác thực ưu đãi!`,
        );
      }
    }

    // 8. Tính toán mức chiết khấu và tổng tiền sau giảm giá
    const packagePrice = Number(medicalPackage.price);
    const voucherDiscount = Number(voucher.discountValue);
    const discountAmount = Math.min(voucherDiscount, packagePrice);
    const finalAmount = Math.max(0, packagePrice - discountAmount);

    this.logger.log(
      `✅ Xác thực voucher [${voucher.code}] thành công cho khách hàng [${normalizedPhone}]. Giảm: ${discountAmount}đ, Thanh toán: ${finalAmount}đ`,
    );

    return {
      valid: true,
      message: `Áp dụng mã giảm giá [${voucher.code}] thành công!`,
      voucher: {
        id: voucher.id,
        code: voucher.code,
        discountValue: voucherDiscount,
        affiliatePartner: {
          id: voucher.affiliateUser.id,
          name: voucher.affiliateUser.fullName,
        },
      },
      package: {
        id: medicalPackage.id,
        name: medicalPackage.name,
        targetAudience: medicalPackage.targetAudience,
        originalPrice: Number(medicalPackage.originalPrice),
        price: packagePrice,
      },
      pricing: {
        packagePrice,
        discountAmount,
        finalAmount,
      },
    };
  }

  /**
   * Helper: Sinh mã QR Code dưới dạng Base64 Data URL (Chuẩn y tế tone màu xanh ngọc #059669)
   */
  async generateQrCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
        color: {
          dark: '#059669', // Tone màu xanh y tế chuyên nghiệp
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      this.logger.error('Lỗi sinh mã QR Code:', error);
      throw error;
    }
  }
}
