import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TargetAudience } from '@prisma/client';
import { MedicalPackagesService } from './medical-packages.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MedicalPackagesService', () => {
  let service: MedicalPackagesService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      medicalPackage: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      commissionTier: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalPackagesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<MedicalPackagesService>(MedicalPackagesService);
  });

  describe('findAll', () => {
    it('should return a list of medical packages', async () => {
      const mockPackages = [
        { id: '1', code: 'MED-SV-01', name: 'Gói SV', price: 199000, isActive: true },
        { id: '2', code: 'MED-IT-02', name: 'Gói IT', price: 250000, isActive: true },
      ];
      prisma.medicalPackage.findMany.mockResolvedValue(mockPackages);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(prisma.medicalPackage.findMany).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should throw NotFoundException if slug not found', async () => {
      prisma.medicalPackage.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('khong-ton-tai')).rejects.toThrow(NotFoundException);
    });

    it('should return package details if slug exists', async () => {
      const mockPkg = {
        id: 'pkg-1',
        slug: 'kham-suc-khoe-sinh-vien-agu',
        name: 'Gói Sinh Viên AGU',
      };
      prisma.medicalPackage.findUnique.mockResolvedValue(mockPkg);

      const result = await service.findBySlug('kham-suc-khoe-sinh-vien-agu');
      expect(result.id).toBe('pkg-1');
      expect(result.slug).toBe('kham-suc-khoe-sinh-vien-agu');
    });
  });

  describe('create', () => {
    it('should throw ConflictException if package code already exists', async () => {
      prisma.medicalPackage.findUnique.mockResolvedValueOnce({ id: 'existing-id', code: 'MED-SV-01' });

      await expect(
        service.create({
          code: 'MED-SV-01',
          name: 'Gói trùng mã',
          slug: 'slug-moi',
          originalPrice: 350000,
          price: 199000,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new package successfully', async () => {
      prisma.medicalPackage.findUnique.mockResolvedValue(null);
      prisma.medicalPackage.create.mockResolvedValue({
        id: 'new-pkg-id',
        code: 'MED-NEW-01',
        name: 'Gói Mới',
        slug: 'goi-moi',
        originalPrice: 500000,
        price: 300000,
        isActive: true,
      });

      const result = await service.create({
        code: 'MED-NEW-01',
        name: 'Gói Mới',
        slug: 'goi-moi',
        originalPrice: 500000,
        price: 300000,
      });

      expect(result.code).toBe('MED-NEW-01');
      expect(prisma.medicalPackage.create).toHaveBeenCalled();
    });
  });

  describe('getCommissionTiers', () => {
    it('should return commission tiers with formatted percentages and range displays', async () => {
      const mockTiers = [
        { tierLevel: 1, name: 'Đồng', minOrders: 1, maxOrders: 5, commissionRate: 0.1 },
        { tierLevel: 2, name: 'Bạc', minOrders: 6, maxOrders: 15, commissionRate: 0.12 },
        { tierLevel: 3, name: 'Vàng', minOrders: 16, maxOrders: null, commissionRate: 0.15 },
      ];
      prisma.commissionTier.findMany.mockResolvedValue(mockTiers);

      const result = await service.getCommissionTiers();
      expect(result).toHaveLength(3);
      expect(result[0].percentageDisplay).toBe('10%');
      expect(result[1].percentageDisplay).toBe('12%');
      expect(result[2].percentageDisplay).toBe('15%');
      expect(result[2].rangeDisplay).toContain('trở lên');
    });
  });
});
