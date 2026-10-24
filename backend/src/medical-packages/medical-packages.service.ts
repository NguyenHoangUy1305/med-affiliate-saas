import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageQueryDto } from './dto/package-query.dto';

@Injectable()
export class MedicalPackagesService {
  private readonly logger = new Logger(MedicalPackagesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách gói khám y tế có hỗ trợ lọc và tìm kiếm
   */
  async findAll(query?: PackageQueryDto) {
    const where: Prisma.MedicalPackageWhereInput = {};

    if (query?.onlyActive === 'true') {
      where.isActive = true;
    }

    if (query?.targetAudience) {
      where.targetAudience = query.targetAudience;
    }

    if (query?.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm } },
        { code: { contains: searchTerm } },
        { description: { contains: searchTerm } },
      ];
    }

    let orderBy: Prisma.MedicalPackageOrderByWithRelationInput = { price: 'asc' };
    if (query?.sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query?.sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    return this.prisma.medicalPackage.findMany({
      where,
      orderBy,
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });
  }

  /**
   * Lấy chi tiết gói khám theo đường dẫn thân thiện (SEO Slug)
   * Phục vụ trang chi tiết gói khám trên Frontend Storefront
   */
  async findBySlug(slug: string) {
    const pkg = await this.prisma.medicalPackage.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Không tìm thấy gói khám với đường dẫn [${slug}]`);
    }

    return pkg;
  }

  /**
   * Lấy chi tiết gói khám theo ID định danh
   */
  async findById(id: string) {
    const pkg = await this.prisma.medicalPackage.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!pkg) {
      throw new NotFoundException(`Không tìm thấy gói khám với mã ID [${id}]`);
    }

    return pkg;
  }

  /**
   * Tạo gói khám y tế mới (Chỉ SUPER_ADMIN)
   */
  async create(dto: CreatePackageDto) {
    const normalizedCode = dto.code.toUpperCase().trim();
    const normalizedSlug = dto.slug.toLowerCase().trim();

    // 1. Kiểm tra trùng mã gói
    const existingCode = await this.prisma.medicalPackage.findUnique({
      where: { code: normalizedCode },
    });
    if (existingCode) {
      throw new ConflictException(`Mã gói khám [${normalizedCode}] đã tồn tại trong hệ thống`);
    }

    // 2. Kiểm tra trùng slug SEO
    const existingSlug = await this.prisma.medicalPackage.findUnique({
      where: { slug: normalizedSlug },
    });
    if (existingSlug) {
      throw new ConflictException(`Đường dẫn slug [${normalizedSlug}] đã được sử dụng`);
    }

    const created = await this.prisma.medicalPackage.create({
      data: {
        code: normalizedCode,
        name: dto.name.trim(),
        slug: normalizedSlug,
        originalPrice: new Prisma.Decimal(dto.originalPrice),
        price: new Prisma.Decimal(dto.price),
        description: dto.description?.trim(),
        details: dto.details ?? Prisma.JsonNull,
        targetAudience: dto.targetAudience || 'ALL',
        isActive: true,
      },
    });

    this.logger.log(`🩺 Đã tạo mới gói khám y tế: [${created.code}] - ${created.name}`);
    return created;
  }

  /**
   * Cập nhật thông tin gói khám (Chỉ SUPER_ADMIN)
   */
  async update(id: string, dto: UpdatePackageDto) {
    await this.findById(id);

    if (dto.code) {
      const normalizedCode = dto.code.toUpperCase().trim();
      const existingCode = await this.prisma.medicalPackage.findUnique({
        where: { code: normalizedCode },
      });
      if (existingCode && existingCode.id !== id) {
        throw new ConflictException(`Mã gói khám [${normalizedCode}] đã được sử dụng`);
      }
      dto.code = normalizedCode;
    }

    if (dto.slug) {
      const normalizedSlug = dto.slug.toLowerCase().trim();
      const existingSlug = await this.prisma.medicalPackage.findUnique({
        where: { slug: normalizedSlug },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(`Đường dẫn slug [${normalizedSlug}] đã được sử dụng`);
      }
      dto.slug = normalizedSlug;
    }

    const data: Prisma.MedicalPackageUpdateInput = {
      ...dto,
      name: dto.name?.trim(),
      description: dto.description?.trim(),
    };

    if (dto.originalPrice !== undefined) {
      data.originalPrice = new Prisma.Decimal(dto.originalPrice);
    }
    if (dto.price !== undefined) {
      data.price = new Prisma.Decimal(dto.price);
    }
    if (dto.details !== undefined) {
      data.details = dto.details;
    }

    const updated = await this.prisma.medicalPackage.update({
      where: { id },
      data,
    });

    this.logger.log(`📝 Đã cập nhật gói khám: [${updated.code}] - ${updated.name}`);
    return updated;
  }

  /**
   * Bật / tắt trạng thái kích hoạt của gói khám
   */
  async toggleActive(id: string) {
    const pkg = await this.findById(id);
    const updated = await this.prisma.medicalPackage.update({
      where: { id },
      data: { isActive: !pkg.isActive },
    });

    this.logger.log(`🔄 Gói khám [${updated.code}] đổi trạng thái: isActive = ${updated.isActive}`);
    return updated;
  }

  /**
   * Lấy danh sách chính sách Bậc hoa hồng mẫu (Commission Tiers)
   * Công khai để các Cộng tác viên theo dõi thang bậc thưởng lũy tiến
   */
  async getCommissionTiers() {
    const tiers = await this.prisma.commissionTier.findMany({
      orderBy: { tierLevel: 'asc' },
    });

    return tiers.map((tier) => ({
      ...tier,
      percentageDisplay: `${Number(tier.commissionRate) * 100}%`,
      rangeDisplay: tier.maxOrders
        ? `Từ ${tier.minOrders} đến ${tier.maxOrders} đơn hàng/tháng`
        : `Từ ${tier.minOrders} đơn hàng/tháng trở lên`,
    }));
  }
}
