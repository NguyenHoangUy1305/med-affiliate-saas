import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách tất cả các chi nhánh y tế
   * @param onlyActive Nếu true chỉ trả về các chi nhánh đang hoạt động tiếp nhận bệnh nhân
   */
  async findAll(onlyActive: boolean = false) {
    return this.prisma.tenant.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            orders: true,
            users: true,
          },
        },
      },
    });
  }

  /**
   * Xem chi tiết một chi nhánh theo ID
   */
  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            users: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Không tìm thấy cơ sở y tế với mã định danh [${id}]`);
    }

    return tenant;
  }

  /**
   * Tạo mới một chi nhánh y tế (Chỉ SUPER_ADMIN)
   */
  async create(dto: CreateTenantDto) {
    const normalizedCode = dto.code.toUpperCase().trim();

    const existingCode = await this.prisma.tenant.findUnique({
      where: { code: normalizedCode },
    });

    if (existingCode) {
      throw new ConflictException(`Mã chi nhánh [${normalizedCode}] đã tồn tại trong hệ thống`);
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        code: normalizedCode,
        name: dto.name.trim(),
        address: dto.address.trim(),
        phone: dto.phone.trim(),
        isActive: true,
      },
    });

    this.logger.log(`🏥 Đã tạo mới chi nhánh y tế: [${tenant.code}] - ${tenant.name}`);
    return tenant;
  }

  /**
   * Cập nhật thông tin chi nhánh (Chỉ SUPER_ADMIN)
   */
  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id); // Đảm bảo tồn tại

    if (dto.code) {
      const normalizedCode = dto.code.toUpperCase().trim();
      const existing = await this.prisma.tenant.findUnique({
        where: { code: normalizedCode },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Mã chi nhánh [${normalizedCode}] đã được sử dụng bởi cơ sở khác`);
      }
      dto.code = normalizedCode;
    }

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...dto,
        name: dto.name?.trim(),
        address: dto.address?.trim(),
        phone: dto.phone?.trim(),
      },
    });

    this.logger.log(`📝 Đã cập nhật chi nhánh: [${updated.code}] - ${updated.name}`);
    return updated;
  }

  /**
   * Vô hiệu hóa (ngừng nhận bệnh) hoặc kích hoạt lại chi nhánh
   */
  async toggleActive(id: string) {
    const tenant = await this.findOne(id);
    const updated = await this.prisma.tenant.update({
      where: { id },
      data: { isActive: !tenant.isActive },
    });

    this.logger.log(`🔄 Chi nhánh [${updated.code}] đổi trạng thái: isActive = ${updated.isActive}`);
    return updated;
  }
}
