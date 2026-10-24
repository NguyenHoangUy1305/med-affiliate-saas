import { Injectable, UnauthorizedException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng nhập hệ thống (Áp dụng cho mọi vai trò: Admin, Lễ tân, CTV, Nhân viên, Khách hàng)
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
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

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`🔑 Người dùng [${user.email}] (${user.role}) đăng nhập thành công`);

    const { passwordHash: _, ...userSafeData } = user;

    return {
      message: 'Đăng nhập thành công',
      accessToken,
      user: userSafeData,
    };
  }

  /**
   * Đăng ký tài khoản Cộng tác viên (AFFILIATE_PARTNER)
   * Tự động khởi tạo Ví điện tử số dư 0 VNĐ trong cùng một transaction
   */
  async registerPartner(dto: RegisterPartnerDto) {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // 1. Kiểm tra trùng lặp email
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      throw new ConflictException('Địa chỉ email này đã được đăng ký tài khoản');
    }

    // 2. Kiểm tra trùng lặp số điện thoại
    const existingPhone = await this.prisma.user.findFirst({
      where: { phone: dto.phone.trim() },
    });
    if (existingPhone) {
      throw new ConflictException('Số điện thoại này đã được đăng ký tài khoản');
    }

    // 3. Mã hóa mật khẩu
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // 4. Thực thi transaction nguyên tử: Tạo User CTV + Khởi tạo Ví điện tử 0 VNĐ
    const result = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          fullName: dto.fullName.trim(),
          email: normalizedEmail,
          phone: dto.phone.trim(),
          passwordHash,
          role: Role.AFFILIATE_PARTNER,
          isActive: true,
        },
      });

      const newWallet = await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: 0,
          lockedBalance: 0,
          totalEarned: 0,
        },
      });

      return { user: newUser, wallet: newWallet };
    });

    this.logger.log(`🎉 Đối tác mới [${result.user.email}] đăng ký CTV & tạo ví thành công!`);

    // 5. Cấp Access Token ngay sau khi đăng ký
    const payload: JwtPayload = {
      sub: result.user.id,
      email: result.user.email,
      role: result.user.role,
      tenantId: null,
    };

    const accessToken = this.jwtService.sign(payload);
    const { passwordHash: _, ...userSafeData } = result.user;

    return {
      message: 'Đăng ký tài khoản Cộng tác viên thành công',
      accessToken,
      user: userSafeData,
      wallet: {
        id: result.wallet.id,
        balance: result.wallet.balance,
        totalEarned: result.wallet.totalEarned,
      },
    };
  }

  /**
   * Lấy thông tin cá nhân và số dư ví của người dùng hiện tại
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
            phone: true,
          },
        },
        wallet: {
          select: {
            id: true,
            balance: true,
            lockedBalance: true,
            totalEarned: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy thông tin người dùng');
    }

    const { passwordHash: _, ...userSafeData } = user;
    return userSafeData;
  }
}
