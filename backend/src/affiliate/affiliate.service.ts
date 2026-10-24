import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as QRCode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';

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
