import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'MedAffiliate SaaS Backend API v1.0 is running!';
  }

  async getHealthStatus() {
    let dbStatus = 'DISCONNECTED';
    let dbStats: Record<string, number> = {};

    try {
      // Kiểm tra kết nối CSDL và đếm nhanh bản ghi
      const [tenantsCount, packagesCount, usersCount] = await Promise.all([
        this.prisma.tenant.count(),
        this.prisma.medicalPackage.count(),
        this.prisma.user.count(),
      ]);

      dbStatus = 'CONNECTED';
      dbStats = {
        tenants: tenantsCount,
        medicalPackages: packagesCount,
        users: usersCount,
      };
    } catch (error) {
      this.logger.error('Health check failed to query database:', error);
      dbStatus = 'ERROR';
    }

    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: dbStatus,
        stats: dbStats,
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
