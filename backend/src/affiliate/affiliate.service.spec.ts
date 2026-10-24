import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ConflictException, NotFoundException } from '@nestjs/common';
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
});
