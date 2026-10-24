import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwtService: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      wallet: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (callback) => {
        return callback(prisma);
      }),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token_12345'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@medsaas.vn', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when account is inactive', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'inactive@medsaas.vn',
        passwordHash: 'hashed_pw',
        isActive: false,
      });

      await expect(
        service.login({ email: 'inactive@medsaas.vn', password: 'Password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      const hashed = await bcrypt.hash('CorrectPassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'user@medsaas.vn',
        passwordHash: hashed,
        isActive: true,
      });

      await expect(
        service.login({ email: 'user@medsaas.vn', password: 'WrongPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return accessToken and safe user data on valid credentials', async () => {
      const password = 'MedSaas@2026';
      const hashed = await bcrypt.hash(password, 10);

      prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        email: 'nguyenhoanguy@medsaas.vn',
        fullName: 'Nguyễn Hoàng Uy',
        role: Role.SUPER_ADMIN,
        tenantId: null,
        passwordHash: hashed,
        isActive: true,
        tenant: null,
        wallet: null,
      });

      const result = await service.login({
        email: 'nguyenhoanguy@medsaas.vn',
        password,
      });

      expect(result.accessToken).toBe('mock_jwt_token_12345');
      expect(result.user.email).toBe('nguyenhoanguy@medsaas.vn');
      expect((result.user as any).passwordHash).toBeUndefined();
    });
  });

  describe('registerPartner', () => {
    it('should throw ConflictException if email exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.registerPartner({
          fullName: 'Test CTV',
          email: 'existing@medsaas.vn',
          phone: '0988123456',
          password: 'Password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should successfully create CTV and Wallet atomically in transaction', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.findFirst.mockResolvedValue(null);

      prisma.user.create.mockResolvedValue({
        id: 'new-ctv-1',
        fullName: 'Nguyễn Văn CTV',
        email: 'ctv@medsaas.vn',
        phone: '0988123456',
        role: Role.AFFILIATE_PARTNER,
        isActive: true,
      });

      prisma.wallet.create.mockResolvedValue({
        id: 'wallet-1',
        userId: 'new-ctv-1',
        balance: 0,
        totalEarned: 0,
      });

      const result = await service.registerPartner({
        fullName: 'Nguyễn Văn CTV',
        email: 'ctv@medsaas.vn',
        phone: '0988123456',
        password: 'Password123',
      });

      expect(result.accessToken).toBe('mock_jwt_token_12345');
      expect(result.user.role).toBe(Role.AFFILIATE_PARTNER);
      expect(result.wallet.balance).toBe(0);
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
