import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { TargetAudience } from '@prisma/client';
import { AffiliateService } from './affiliate.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AffiliateService', () => {
  let service: AffiliateService;
  let prisma: any;
  let configService: any;

  beforeEach(async () => {
    prisma = {
      voucher: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      medicalPackage: {
        findUnique: jest.fn(),
      },
    };

    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AffiliateService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AffiliateService>(AffiliateService);
  });

  describe('createVoucher', () => {
    it('should throw ConflictException if voucher code already exists', async () => {
      prisma.voucher.findUnique.mockResolvedValue({ id: 'v1', code: 'UY_AGU50' });

      await expect(
        service.createVoucher('user-1', {
          code: 'UY_AGU50',
          discountValue: 20000,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create voucher, generate tracking URL and Base64 QR code', async () => {
      prisma.voucher.findUnique.mockResolvedValue(null);
      prisma.voucher.create.mockResolvedValue({
        id: 'new-v-id',
        affiliateUserId: 'user-1',
        code: 'UY_AGU50',
        discountValue: 20000,
        maxUsage: 100,
        usedCount: 0,
        isActive: true,
      });

      const result = await service.createVoucher('user-1', {
        code: 'UY_AGU50',
        discountValue: 20000,
      });

      expect(result.voucher.code).toBe('UY_AGU50');
      expect(result.trackingUrl).toBe('http://localhost:3000/packages?ref=UY_AGU50');
      expect(result.qrCodeBase64).toContain('data:image/png;base64');
    });
  });

  describe('getMyCampaigns', () => {
    it('should return CTV campaigns list with generated tracking links and QR codes', async () => {
      prisma.voucher.findMany.mockResolvedValue([
        {
          id: 'v1',
          code: 'NGHI10',
          discountValue: 20000,
          maxUsage: 100,
          usedCount: 15,
          expiryDate: null,
          isActive: true,
          createdAt: new Date(),
          _count: { orders: 15 },
        },
      ]);

      const result = await service.getMyCampaigns('user-nghi');
      expect(result.totalCampaigns).toBe(1);
      expect(result.campaigns[0].code).toBe('NGHI10');
      expect(result.campaigns[0].remainingUsage).toBe(85);
      expect(result.campaigns[0].trackingUrl).toBe('http://localhost:3000/packages?ref=NGHI10');
      expect(result.campaigns[0].qrCodeBase64).toContain('data:image/png;base64');
    });
  });

  describe('getVoucherDetails', () => {
    it('should throw NotFoundException if voucher does not exist', async () => {
      prisma.voucher.findUnique.mockResolvedValue(null);

      await expect(service.getVoucherDetails('INVALID')).rejects.toThrow(NotFoundException);
    });

    it('should return voucher details and affiliate partner name', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        code: 'NGHI10',
        discountValue: 20000,
        isActive: true,
        expiryDate: null,
        usedCount: 5,
        maxUsage: 100,
        affiliateUser: {
          id: 'user-nghi',
          fullName: 'Thái Vĩnh Nghi',
        },
      });

      const result = await service.getVoucherDetails('NGHI10');
      expect(result.code).toBe('NGHI10');
      expect(result.discountValue).toBe(20000);
      expect(result.affiliatePartner.name).toBe('Thái Vĩnh Nghi');
    });
  });

  describe('validateVoucher (Anti-Fraud Engine)', () => {
    const mockVoucher = {
      id: 'voucher-1',
      code: 'UY_AGU50',
      discountValue: 50000,
      maxUsage: 100,
      usedCount: 10,
      expiryDate: null,
      isActive: true,
      affiliateUser: {
        id: 'affiliate-uy',
        fullName: 'Nguyễn Hoàng Uy',
        email: 'uy@medsaas.vn',
        phone: '0912345678',
      },
    };

    const mockGeneralPackage = {
      id: 'pkg-general',
      name: 'Gói Khám Tổng Quát Tiêu Chuẩn',
      targetAudience: TargetAudience.ALL,
      originalPrice: 500000,
      price: 450000,
      isActive: true,
    };

    const mockStudentPackage = {
      id: 'pkg-student',
      name: 'Gói Khám Sức Khỏe Sinh Viên AGU',
      targetAudience: TargetAudience.STUDENT_ONLY,
      originalPrice: 300000,
      price: 250000,
      isActive: true,
    };

    it('should throw NotFoundException if voucher does not exist', async () => {
      prisma.voucher.findUnique.mockResolvedValue(null);

      await expect(
        service.validateVoucher({
          voucherCode: 'NONEXISTENT',
          packageId: 'pkg-general',
          customerPhone: '0987654321',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if voucher is inactive', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...mockVoucher,
        isActive: false,
      });

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-general',
          customerPhone: '0987654321',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if voucher is expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      prisma.voucher.findUnique.mockResolvedValue({
        ...mockVoucher,
        expiryDate: pastDate,
      });

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-general',
          customerPhone: '0987654321',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if voucher reached max usage', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        ...mockVoucher,
        maxUsage: 50,
        usedCount: 50,
      });

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-general',
          customerPhone: '0987654321',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on Self-Referral fraud by phone', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-general',
          customerPhone: '0912345678', // Trùng SĐT của CTV Uy
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on Self-Referral fraud by email', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-general',
          customerPhone: '0987654321',
          customerEmail: 'uy@medsaas.vn', // Trùng Email của CTV Uy
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if package does not exist', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);
      prisma.medicalPackage.findUnique.mockResolvedValue(null);

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'non-existent-pkg',
          customerPhone: '0987654321',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if package is inactive', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);
      prisma.medicalPackage.findUnique.mockResolvedValue({
        ...mockGeneralPackage,
        isActive: false,
      });

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-general',
          customerPhone: '0987654321',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if package is STUDENT_ONLY and email is not @agu.edu.vn', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockStudentPackage);

      await expect(
        service.validateVoucher({
          voucherCode: 'UY_AGU50',
          packageId: 'pkg-student',
          customerPhone: '0987654321',
          customerEmail: 'patient@gmail.com', // Không phải đuôi @agu.edu.vn
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully validate voucher for general package', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockGeneralPackage);

      const result = await service.validateVoucher({
        voucherCode: 'UY_AGU50',
        packageId: 'pkg-general',
        customerPhone: '0987654321',
        customerEmail: 'patient@gmail.com',
      });

      expect(result.valid).toBe(true);
      expect(result.voucher.code).toBe('UY_AGU50');
      expect(result.pricing.packagePrice).toBe(450000);
      expect(result.pricing.discountAmount).toBe(50000);
      expect(result.pricing.finalAmount).toBe(400000);
    });

    it('should successfully validate voucher for STUDENT_ONLY package with valid @agu.edu.vn email', async () => {
      prisma.voucher.findUnique.mockResolvedValue(mockVoucher);
      prisma.medicalPackage.findUnique.mockResolvedValue(mockStudentPackage);

      const result = await service.validateVoucher({
        voucherCode: 'UY_AGU50',
        packageId: 'pkg-student',
        customerPhone: '0987654321',
        customerEmail: 'dth215888@agu.edu.vn',
      });

      expect(result.valid).toBe(true);
      expect(result.package.targetAudience).toBe(TargetAudience.STUDENT_ONLY);
      expect(result.pricing.packagePrice).toBe(250000);
      expect(result.pricing.discountAmount).toBe(50000);
      expect(result.pricing.finalAmount).toBe(200000);
    });
  });
});
