import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super_secret_jwt_med_saas_agu_2026',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
            lockedBalance: true,
            totalEarned: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Phiên đăng nhập không hợp lệ hoặc tài khoản đã bị khóa');
    }

    // Không trả về passwordHash trong req.user
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
