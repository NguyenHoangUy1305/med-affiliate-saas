import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const mockPrismaService = {
      tenant: { count: jest.fn().mockResolvedValue(8) },
      medicalPackage: { count: jest.fn().mockResolvedValue(8) },
      user: { count: jest.fn().mockResolvedValue(179) },
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      expect(appController.getHello()).toContain('MedAffiliate SaaS Backend API');
    });

    it('should return health status', async () => {
      const health = await appController.getHealth();
      expect(health.status).toBe('UP');
      expect(health.database.status).toBe('CONNECTED');
      expect(health.database.stats.tenants).toBe(8);
    });
  });
});
