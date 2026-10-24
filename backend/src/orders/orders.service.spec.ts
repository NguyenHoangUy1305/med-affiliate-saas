import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, CommissionStatus, PaymentMethod, TargetAudience, Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AffiliateService } from '../affiliate/affiliate.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: any;
  let affiliateService: any;

  const mockTenant = {
    id: 'tenant-1',
    name: 'Bệnh viện Đa khoa Trung tâm An Giang',
    address: '02 Lê Lợi, TP. Long Xuyên, An Giang',
    phone: '02963852777',
    isActive: true,
  };

  const mockGeneralPackage = {
    id: 'pkg-1',
    name: 'Gói Khám Tổng Quát Tiêu Chuẩn',
    slug: 'kham-tong-quat-tieu-chuan',
    originalPrice: 700000,
    price: 590000,
    targetAudience: TargetAudience.ALL,
    isActive: true,
    details: { items: ['Khám nội', 'Xét nghiệm máu'] },
  };

  const mockStudentPackage = {
    id: 'pkg-student',
    name: 'Gói Khám Sức Khỏe Sinh Viên AGU',
    slug: 'kham-suc-khoe-sinh-vien-agu',
    originalPrice: 250000,
    price: 199000,
    targetAudience: TargetAudience.STUDENT_ONLY,
    isActive: true,
  };

  const mockTiers = [
    { tierLevel: 1, minOrders: 1, maxOrders: 5, commissionRate: 0.10 },
    { tierLevel: 2, minOrders: 6, maxOrders: 15, commissionRate: 0.12 },
    { tierLevel: 3, minOrders: 16, maxOrders: null, commissionRate: 0.15 },
  ];

  beforeEach(async () => {
    prisma = {
      tenant: {
        findUnique: jest.fn(),
      },
      medicalPackage: {
        findUnique: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
      },
      voucher: {
        update: jest.fn(),
      },
      commissionTier: {
        findMany: jest.fn().mockResolvedValue(mockTiers),
      },
      $transaction: jest.fn((callback) => callback(prisma)),
    };

    affiliateService = {
      validateVoucher: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AffiliateService, useValue: affiliateService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('createOrder', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);

    it('should throw NotFoundException if tenant does not exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder({
          patientName: 'Nguyễn Văn A',
          patientPhone: '0912345678',
          tenantId: 'invalid-tenant',
          packageId: 'pkg-1',
          appointmentDate: futureDate.toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if tenant is inactive', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ ...mockTenant, isActive: false });

      await expect(
        service.createOrder({
          patientName: 'Nguyễn Văn A',
          patientPhone: '0912345678',
          tenantId: 'tenant-1',
          packageId: 'pkg-1',
          appointmentDate: futureDate.toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if package does not exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.medicalPackage.findUnique.mockResolvedValue(null);

      await expect(
        service.createOrder({
          patientName: 'Nguyễn Văn A',
          patientPhone: '0912345678',
          tenantId: 'tenant-1',
          packageId: 'invalid-pkg',
          appointmentDate: futureDate.toISOString(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if appointmentDate is in the past', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockGeneralPackage);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);

      await expect(
        service.createOrder({
          patientName: 'Nguyễn Văn A',
          patientPhone: '0912345678',
          tenantId: 'tenant-1',
          packageId: 'pkg-1',
          appointmentDate: pastDate.toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if package is STUDENT_ONLY and patient has no @agu.edu.vn email', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockStudentPackage);

      await expect(
        service.createOrder({
          patientName: 'Nguyễn Văn A',
          patientPhone: '0912345678',
          patientEmail: 'patient@gmail.com',
          tenantId: 'tenant-1',
          packageId: 'pkg-student',
          appointmentDate: futureDate.toISOString(),
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create order successfully with voucher and calculate commission', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockGeneralPackage);
      prisma.order.findUnique.mockResolvedValue(null); // No collision on bookingCode
      prisma.order.count.mockResolvedValue(3); // CTV has 3 completed orders -> Tier 1 (10%)

      affiliateService.validateVoucher.mockResolvedValue({
        valid: true,
        voucher: {
          id: 'v-1',
          code: 'UY_AGU50',
          affiliatePartner: { id: 'ctv-uy', fullName: 'Nguyễn Hoàng Uy' },
        },
        pricing: {
          packagePrice: 590000,
          discountAmount: 50000,
          finalAmount: 540000,
        },
      });

      const mockCreatedOrder = {
        id: 'ord-123',
        bookingCode: 'MED-202610-A9X2',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0988776655',
        patientEmail: 'patient@gmail.com',
        appointmentDate: futureDate,
        totalAmount: 540000,
        discountAmount: 50000,
        commissionAmount: 54000, // 540.000 * 10%
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.AT_COUNTER,
        createdAt: new Date(),
        tenant: mockTenant,
        package: mockGeneralPackage,
        voucher: { id: 'v-1', code: 'UY_AGU50', discountValue: 50000 },
        affiliateUser: { id: 'ctv-uy', fullName: 'Nguyễn Hoàng Uy' },
      };

      prisma.order.create.mockResolvedValue(mockCreatedOrder);

      const result = await service.createOrder({
        patientName: 'Nguyễn Văn A',
        patientPhone: '0988776655',
        patientEmail: 'patient@gmail.com',
        tenantId: 'tenant-1',
        packageId: 'pkg-1',
        appointmentDate: futureDate.toISOString(),
        voucherCode: 'UY_AGU50',
      });

      expect(result.message).toBe('Đặt lịch khám thành công!');
      expect(result.order.bookingCode).toBe('MED-202610-A9X2');
      expect(result.order.pricing.discountAmount).toBe(50000);
      expect(result.order.pricing.totalToPay).toBe(540000);
      expect(result.order.affiliate?.pendingCommission).toBe(54000);
      expect(prisma.voucher.update).toHaveBeenCalledWith({
        where: { id: 'v-1' },
        data: { usedCount: { increment: 1 } },
      });
    });

    it('should create order successfully without voucher for general package', async () => {
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockGeneralPackage);
      prisma.order.findUnique.mockResolvedValue(null);

      const mockCreatedOrder = {
        id: 'ord-456',
        bookingCode: 'MED-202610-B1K2',
        patientName: 'Trần Thị B',
        patientPhone: '0977665544',
        patientEmail: 'tranthib@gmail.com',
        appointmentDate: futureDate,
        totalAmount: 590000,
        discountAmount: 0,
        commissionAmount: 0,
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.AT_COUNTER,
        createdAt: new Date(),
        tenant: mockTenant,
        package: mockGeneralPackage,
        voucher: null,
        affiliateUser: null,
      };

      prisma.order.create.mockResolvedValue(mockCreatedOrder);

      const result = await service.createOrder({
        patientName: 'Trần Thị B',
        patientPhone: '0977665544',
        patientEmail: 'tranthib@gmail.com',
        tenantId: 'tenant-1',
        packageId: 'pkg-1',
        appointmentDate: futureDate.toISOString(),
      });

      expect(result.order.bookingCode).toBe('MED-202610-B1K2');
      expect(result.order.pricing.discountAmount).toBe(0);
      expect(result.order.pricing.totalToPay).toBe(590000);
      expect(result.order.voucher).toBeNull();
      expect(result.order.affiliate).toBeNull();
    });
  });

  describe('getOrderByBookingCode', () => {
    it('should throw NotFoundException if booking code not found', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderByBookingCode('NON-EXISTENT')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return booking ticket details for valid code', async () => {
      prisma.order.findUnique.mockResolvedValue({
        bookingCode: 'MED-202610-A9X2',
        patientName: 'Nguyễn Văn A',
        patientPhone: '0988776655',
        patientEmail: 'a@gmail.com',
        appointmentDate: new Date(),
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.AT_COUNTER,
        totalAmount: 540000,
        discountAmount: 50000,
        tenant: mockTenant,
        package: mockGeneralPackage,
        voucher: { code: 'UY_AGU50', discountValue: 50000 },
        confirmedBy: null,
        completedAt: null,
        createdAt: new Date(),
      });

      const result = await service.getOrderByBookingCode('MED-202610-A9X2');
      expect(result.bookingCode).toBe('MED-202610-A9X2');
      expect(result.pricing.totalAmount).toBe(540000);
      expect(result.voucher?.code).toBe('UY_AGU50');
    });
  });

  describe('getMyAffiliateOrders', () => {
    it('should return CTV orders with masked patient data and financial summary', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'ord-1',
          bookingCode: 'MED-202610-0001',
          patientName: 'Nguyễn Văn An',
          patientPhone: '0988776655',
          appointmentDate: new Date(),
          totalAmount: 540000,
          commissionAmount: 54000,
          status: OrderStatus.COMPLETED,
          commissionStatus: CommissionStatus.PAID,
          package: { name: 'Gói Tổng Quát', price: 590000 },
          tenant: { name: 'BV Long Xuyên' },
          voucher: { code: 'UY50' },
          createdAt: new Date(),
        },
        {
          id: 'ord-2',
          bookingCode: 'MED-202610-0002',
          patientName: 'Trần Thị Bình',
          patientPhone: '0911223344',
          appointmentDate: new Date(),
          totalAmount: 200000,
          commissionAmount: 24000,
          status: OrderStatus.PENDING,
          commissionStatus: CommissionStatus.PENDING,
          package: { name: 'Gói Sinh Viên', price: 250000 },
          tenant: { name: 'BV Châu Đốc' },
          voucher: { code: 'UY50' },
          createdAt: new Date(),
        },
      ]);

      const result = await service.getMyAffiliateOrders('ctv-uy');
      expect(result.summary.totalOrders).toBe(2);
      expect(result.summary.completedOrders).toBe(1);
      expect(result.summary.pendingOrders).toBe(1);
      expect(result.summary.totalPaidCommission).toBe(54000);
      expect(result.summary.totalPendingCommission).toBe(24000);

      // Check masking of medical privacy
      expect(result.orders[0].maskedPatientPhone).toBe('0988***655');
      expect(result.orders[1].maskedPatientPhone).toBe('0911***344');
    });
  });

  describe('getOrders (Multi-tenant scoping)', () => {
    it('should filter orders by receptionist tenantId', async () => {
      prisma.order.count.mockResolvedValue(1);
      prisma.order.findMany.mockResolvedValue([
        {
          id: 'ord-1',
          bookingCode: 'MED-202610-0001',
          patientName: 'Nguyễn Văn An',
          patientPhone: '0988776655',
          appointmentDate: new Date(),
          totalAmount: 540000,
          discountAmount: 50000,
          commissionAmount: 54000,
          status: OrderStatus.PENDING,
          commissionStatus: CommissionStatus.PENDING,
          paymentMethod: PaymentMethod.AT_COUNTER,
          tenant: { id: 'tenant-ag-lx', name: 'BV Long Xuyên' },
          package: { id: 'pkg-1', name: 'Gói Tổng Quát', price: 590000 },
          voucher: null,
          affiliateUser: null,
          createdAt: new Date(),
        },
      ]);

      const result = await service.getOrders(
        { page: 1, limit: 10 },
        { id: 'receptionist-toan', role: Role.BRANCH_RECEPTIONIST, tenantId: 'tenant-ag-lx' },
      );

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-ag-lx' }),
        }),
      );
      expect(result.meta.total).toBe(1);
    });
  });
});
