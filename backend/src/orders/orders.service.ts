import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma, OrderStatus, CommissionStatus, PaymentMethod, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AffiliateService } from '../affiliate/affiliate.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly affiliateService: AffiliateService,
  ) {}

  /**
   * Tạo phiếu đặt lịch khám y tế trực tuyến (Storefront Booking)
   * Tự động kiểm tra tính hợp lệ cơ sở y tế, gói khám, chống gian lận voucher,
   * tính hoa hồng lũy tiến cho CTV (ở trạng thái COMMISSION_PENDING) và sinh Mã Booking duy nhất.
   */
  async createOrder(dto: CreateOrderDto) {
    // 1. Kiểm tra cơ sở y tế
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Cơ sở y tế không tồn tại.`);
    }
    if (!tenant.isActive) {
      throw new BadRequestException(
        `Cơ sở y tế [${tenant.name}] hiện đang tạm ngưng tiếp nhận đặt hẹn khám.`,
      );
    }

    // 2. Kiểm tra gói khám y tế
    const medicalPackage = await this.prisma.medicalPackage.findUnique({
      where: { id: dto.packageId },
    });
    if (!medicalPackage) {
      throw new NotFoundException(`Gói khám y tế không tồn tại.`);
    }
    if (!medicalPackage.isActive) {
      throw new BadRequestException(
        `Gói khám [${medicalPackage.name}] hiện đang tạm ngưng phục vụ.`,
      );
    }

    // 3. Kiểm tra ngày hẹn khám (phải từ ngày hôm nay trở đi)
    const appointmentDate = new Date(dto.appointmentDate);
    if (isNaN(appointmentDate.getTime())) {
      throw new BadRequestException('Ngày hẹn khám không hợp lệ.');
    }
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (appointmentDate < startOfToday) {
      throw new BadRequestException(
        'Ngày hẹn khám không hợp lệ. Vui lòng chọn ngày từ hôm nay trở về sau.',
      );
    }

    // 4. Xử lý Voucher và Động cơ Chống Gian lận (Anti-Fraud Engine)
    let voucherId: string | null = null;
    let affiliateUserId: string | null = null;
    let discountAmount = 0;
    let totalAmount = Number(medicalPackage.price);
    let commissionAmount = 0;

    if (dto.voucherCode && dto.voucherCode.trim().length > 0) {
      // Xác thực qua Anti-Fraud Engine Ngày 10
      const validation = await this.affiliateService.validateVoucher({
        voucherCode: dto.voucherCode,
        packageId: dto.packageId,
        customerPhone: dto.patientPhone,
        customerEmail: dto.patientEmail,
      });

      voucherId = validation.voucher.id;
      affiliateUserId = validation.voucher.affiliatePartner.id;
      discountAmount = validation.pricing.discountAmount;
      totalAmount = validation.pricing.finalAmount;

      // Tính hoa hồng theo bậc lũy tiến (CommissionTier) của CTV
      const completedOrdersCount = await this.prisma.order.count({
        where: {
          affiliateUserId,
          status: OrderStatus.COMPLETED,
        },
      });

      const tiers = await this.prisma.commissionTier.findMany({
        orderBy: { tierLevel: 'asc' },
      });

      let commissionRate = 0.10; // Bậc Đồng cơ sở: 10%
      for (const tier of tiers) {
        if (
          completedOrdersCount >= tier.minOrders &&
          (tier.maxOrders === null || completedOrdersCount <= tier.maxOrders)
        ) {
          commissionRate = Number(tier.commissionRate);
          break;
        }
      }

      commissionAmount = Math.round(totalAmount * commissionRate);
    } else {
      // Trường hợp không có mã voucher: Vẫn kiểm tra gói sinh viên AGU
      if (medicalPackage.targetAudience === 'STUDENT_ONLY') {
        const email = dto.patientEmail?.toLowerCase().trim();
        if (!email || !email.endsWith('@agu.edu.vn')) {
          throw new BadRequestException(
            `Gói khám [${medicalPackage.name}] là gói ưu đãi đặc quyền dành cho sinh viên Đại học An Giang. Vui lòng nhập email trường (@agu.edu.vn) để xác thực!`,
          );
        }
      }
    }

    // 5. Sinh Mã Phiếu Khám Điện Tử duy nhất (Ví dụ: MED-202610-A9X2)
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    let bookingCode = '';
    let attempts = 0;
    while (attempts < 10) {
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const candidate = `MED-${yearMonth}-${randomPart}`;
      const exists = await this.prisma.order.findUnique({
        where: { bookingCode: candidate },
      });
      if (!exists) {
        bookingCode = candidate;
        break;
      }
      attempts++;
    }
    if (!bookingCode) {
      bookingCode = `MED-${yearMonth}-${Date.now().toString().slice(-4)}`;
    }

    // 6. Thực thi Transaction nguyên tử
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          bookingCode,
          tenantId: dto.tenantId,
          packageId: dto.packageId,
          affiliateUserId,
          voucherId,
          patientName: dto.patientName.trim(),
          patientPhone: dto.patientPhone.trim(),
          patientEmail: dto.patientEmail?.toLowerCase().trim() || null,
          appointmentDate,
          totalAmount: new Prisma.Decimal(totalAmount),
          discountAmount: new Prisma.Decimal(discountAmount),
          commissionAmount: new Prisma.Decimal(commissionAmount),
          status: OrderStatus.PENDING,
          commissionStatus: CommissionStatus.PENDING,
          paymentMethod: dto.paymentMethod || PaymentMethod.AT_COUNTER,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              address: true,
              phone: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
              slug: true,
              originalPrice: true,
              price: true,
              details: true,
            },
          },
          voucher: {
            select: {
              id: true,
              code: true,
              discountValue: true,
            },
          },
          affiliateUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      // Nếu có dùng voucher, tăng biến đếm usedCount
      if (voucherId) {
        await tx.voucher.update({
          where: { id: voucherId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    this.logger.log(
      `📋 Đã tạo Phiếu Khám [${order.bookingCode}] thành công cho bệnh nhân [${order.patientName}] tại [${order.tenant.name}]. Tổng thanh toán: ${order.totalAmount}đ`,
    );

    return {
      message: 'Đặt lịch khám thành công!',
      order: {
        id: order.id,
        bookingCode: order.bookingCode,
        patientName: order.patientName,
        patientPhone: order.patientPhone,
        patientEmail: order.patientEmail,
        appointmentDate: order.appointmentDate,
        status: order.status,
        paymentMethod: order.paymentMethod,
        tenant: order.tenant,
        package: order.package,
        pricing: {
          originalPrice: Number(order.package.originalPrice),
          packagePrice: Number(order.package.price),
          discountAmount: Number(order.discountAmount),
          totalToPay: Number(order.totalAmount),
        },
        voucher: order.voucher
          ? {
              code: order.voucher.code,
              discountValue: Number(order.voucher.discountValue),
            }
          : null,
        affiliate: order.affiliateUser
          ? {
              id: order.affiliateUser.id,
              name: order.affiliateUser.fullName,
              pendingCommission: Number(order.commissionAmount),
            }
          : null,
        createdAt: order.createdAt,
      },
    };
  }

  /**
   * Tra cứu thông tin Phiếu khám điện tử theo mã Booking Code (Công khai)
   * Dành cho bệnh nhân xem lại lịch hẹn, hoặc Lễ tân quét mã/nhập mã tra cứu tại quầy
   */
  async getOrderByBookingCode(bookingCode: string) {
    const normalizedCode = bookingCode.toUpperCase().trim();
    const order = await this.prisma.order.findUnique({
      where: { bookingCode: normalizedCode },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        package: {
          select: {
            id: true,
            name: true,
            slug: true,
            details: true,
            targetAudience: true,
          },
        },
        voucher: {
          select: {
            code: true,
            discountValue: true,
          },
        },
        confirmedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(
        `Không tìm thấy phiếu khám với mã [${normalizedCode}]. Vui lòng kiểm tra lại.`,
      );
    }

    return {
      bookingCode: order.bookingCode,
      patientName: order.patientName,
      patientPhone: order.patientPhone,
      patientEmail: order.patientEmail,
      appointmentDate: order.appointmentDate,
      status: order.status,
      paymentMethod: order.paymentMethod,
      tenant: order.tenant,
      package: order.package,
      pricing: {
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
      },
      voucher: order.voucher
        ? {
            code: order.voucher.code,
            discountValue: Number(order.voucher.discountValue),
          }
        : null,
      confirmedBy: order.confirmedBy ? order.confirmedBy.fullName : null,
      completedAt: order.completedAt,
      createdAt: order.createdAt,
    };
  }

  /**
   * Lấy danh sách đơn khám theo bộ lọc và phân quyền (RBAC & Multi-tenant)
   */
  async getOrders(
    query: QueryOrdersDto,
    currentUser?: { id: string; role: Role; tenantId?: string },
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    // 1. Phân quyền cô lập đa chi nhánh
    if (currentUser?.role === Role.BRANCH_RECEPTIONIST) {
      // Lễ tân chỉ xem đơn thuộc đúng chi nhánh của mình
      where.tenantId = currentUser.tenantId;
    } else if (currentUser?.role === Role.AFFILIATE_PARTNER) {
      // CTV chỉ xem đơn mình giới thiệu
      where.affiliateUserId = currentUser.id;
    } else if (currentUser?.role === Role.SUPER_ADMIN && query.tenantId) {
      // Super Admin lọc theo tenant tùy chọn
      where.tenantId = query.tenantId;
    }

    // 2. Bộ lọc trạng thái
    if (query.status) {
      where.status = query.status;
    }

    // 3. Tìm kiếm theo từ khóa
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { bookingCode: { contains: term } },
        { patientPhone: { contains: term } },
        { patientName: { contains: term } },
      ];
    }

    const [total, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: { select: { id: true, name: true } },
          package: { select: { id: true, name: true, price: true } },
          voucher: { select: { code: true } },
          affiliateUser: { select: { id: true, fullName: true } },
        },
      }),
    ]);

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: orders.map((o) => ({
        id: o.id,
        bookingCode: o.bookingCode,
        patientName: o.patientName,
        patientPhone: o.patientPhone,
        appointmentDate: o.appointmentDate,
        totalAmount: Number(o.totalAmount),
        discountAmount: Number(o.discountAmount),
        commissionAmount: Number(o.commissionAmount),
        status: o.status,
        commissionStatus: o.commissionStatus,
        paymentMethod: o.paymentMethod,
        tenant: o.tenant,
        package: o.package,
        voucherCode: o.voucher?.code || null,
        affiliateName: o.affiliateUser?.fullName || null,
        createdAt: o.createdAt,
      })),
    };
  }

  /**
   * Lấy danh sách đơn khám dành riêng cho Dashboard CTV
   * (Có che số điện thoại và tên để bảo vệ quyền riêng tư y tế của khách hàng)
   */
  async getMyAffiliateOrders(userId: string) {
    const orders = await this.prisma.order.findMany({
      where: { affiliateUserId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        package: { select: { name: true, price: true } },
        tenant: { select: { name: true } },
        voucher: { select: { code: true } },
      },
    });

    const summary = orders.reduce(
      (acc, o) => {
        acc.totalOrders++;
        if (o.status === OrderStatus.COMPLETED) {
          acc.completedOrders++;
          acc.totalPaidCommission += Number(o.commissionAmount);
        } else if (o.status === OrderStatus.PENDING) {
          acc.pendingOrders++;
          acc.totalPendingCommission += Number(o.commissionAmount);
        }
        return acc;
      },
      {
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalPaidCommission: 0,
        totalPendingCommission: 0,
      },
    );

    return {
      summary,
      orders: orders.map((o) => {
        // Che bớt tên và SĐT bệnh nhân: ví dụ "Nguyễn V***" và "0987***321"
        const parts = o.patientName.split(' ');
        const maskedName =
          parts.length > 1
            ? `${parts[0]} ${'*'.repeat(Math.max(2, parts[parts.length - 1].length))}`
            : o.patientName;
        const maskedPhone =
          o.patientPhone.length >= 8
            ? `${o.patientPhone.slice(0, 4)}***${o.patientPhone.slice(-3)}`
            : o.patientPhone;

        return {
          id: o.id,
          bookingCode: o.bookingCode,
          maskedPatientName: maskedName,
          maskedPatientPhone: maskedPhone,
          appointmentDate: o.appointmentDate,
          totalAmount: Number(o.totalAmount),
          commissionAmount: Number(o.commissionAmount),
          status: o.status,
          commissionStatus: o.commissionStatus,
          packageName: o.package.name,
          hospitalName: o.tenant.name,
          voucherCode: o.voucher?.code || null,
          createdAt: o.createdAt,
        };
      }),
    };
  }
}
