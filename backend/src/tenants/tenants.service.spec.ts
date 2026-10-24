import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TenantsService', () => {
  let service: TenantsService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      tenant: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantsService>(TenantsService);
  });

  describe('findAll', () => {
    it('should return an array of hospital tenants', async () => {
      const mockTenants = [
        { id: '1', code: 'BV-AG-LX', name: 'Bệnh viện ĐK TT An Giang', isActive: true },
        { id: '2', code: 'BV-CD', name: 'Bệnh viện ĐK KV Châu Đốc', isActive: true },
      ];
      prisma.tenant.findMany.mockResolvedValue(mockTenants);

      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(prisma.tenant.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if tenant does not exist', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('should return tenant details if found', async () => {
      const mockTenant = { id: 'tenant-1', code: 'BV-AG-LX', name: 'Bệnh viện ĐK TT An Giang' };
      prisma.tenant.findUnique.mockResolvedValue(mockTenant);

      const result = await service.findOne('tenant-1');
      expect(result.code).toBe('BV-AG-LX');
    });
  });

  describe('create', () => {
    it('should throw ConflictException if code already exists', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 'existing-id', code: 'BV-AG-LX' });

      await expect(
        service.create({
          code: 'BV-AG-LX',
          name: 'Trùng mã',
          address: 'Địa chỉ',
          phone: '02963834646',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new hospital tenant successfully', async () => {
      prisma.tenant.findUnique.mockResolvedValue(null);
      prisma.tenant.create.mockResolvedValue({
        id: 'new-id',
        code: 'PK-MOI',
        name: 'Phòng khám Mới An Giang',
        address: 'Long Xuyên',
        phone: '02963999888',
        isActive: true,
      });

      const result = await service.create({
        code: 'PK-MOI',
        name: 'Phòng khám Mới An Giang',
        address: 'Long Xuyên',
        phone: '02963999888',
      });

      expect(result.code).toBe('PK-MOI');
      expect(prisma.tenant.create).toHaveBeenCalled();
    });
  });

  describe('toggleActive', () => {
    it('should toggle active status from true to false', async () => {
      prisma.tenant.findUnique.mockResolvedValue({ id: 't1', code: 'BV-1', isActive: true });
      prisma.tenant.update.mockResolvedValue({ id: 't1', code: 'BV-1', isActive: false });

      const result = await service.toggleActive('t1');
      expect(result.isActive).toBe(false);
      expect(prisma.tenant.update).toHaveBeenCalledWith({
        where: { id: 't1' },
        data: { isActive: false },
      });
    });
  });
});
