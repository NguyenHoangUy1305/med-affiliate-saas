import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { MedicalPackagesService } from './medical-packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackageQueryDto } from './dto/package-query.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Medical Packages & Gói Khám')
@Controller('medical-packages')
export class MedicalPackagesController {
  constructor(private readonly packagesService: MedicalPackagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các gói khám y tế',
    description: 'Công khai: Hỗ trợ tìm kiếm từ khóa, lọc theo đối tượng áp dụng (ALL / STUDENT_ONLY) và sắp xếp theo giá.',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách gói khám thành công' })
  async findAll(@Query() query: PackageQueryDto) {
    return this.packagesService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Xem chi tiết gói khám theo đường dẫn SEO slug',
    description: 'Công khai: Dùng cho trang chi tiết gói khám Next.js trên Storefront.',
  })
  @ApiResponse({ status: 200, description: 'Tìm thấy gói khám thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói khám' })
  async findBySlug(@Param('slug') slug: string) {
    return this.packagesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết gói khám theo mã định danh ID',
    description: 'Công khai: Lấy thông tin giá, danh mục xét nghiệm và số lượng đơn hàng liên kết.',
  })
  @ApiResponse({ status: 200, description: 'Tìm thấy gói khám thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói khám' })
  async findById(@Param('id') id: string) {
    return this.packagesService.findById(id);
  }

  @Post()
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Thêm mới một gói khám y tế (Chỉ Super Admin)',
    description: 'Yêu cầu quyền SUPER_ADMIN. Nhập mã gói, tên, slug, giá gốc, giá bán và cấu hình danh mục chi tiết.',
  })
  @ApiResponse({ status: 201, description: 'Tạo gói khám thành công' })
  @ApiResponse({ status: 409, description: 'Mã hoặc đường dẫn slug đã tồn tại' })
  async create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Cập nhật thông tin gói khám (Chỉ Super Admin)',
    description: 'Yêu cầu quyền SUPER_ADMIN. Cập nhật giá niêm yết, danh mục chi tiết, mô tả.',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật gói khám thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói khám' })
  async update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.packagesService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Đổi trạng thái hiển thị gói khám trên Storefront (Chỉ Super Admin)',
    description: 'Yêu cầu quyền SUPER_ADMIN. Ẩn hoặc kích hoạt lại gói khám.',
  })
  @ApiResponse({ status: 200, description: 'Đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy gói khám' })
  async toggleActive(@Param('id') id: string) {
    return this.packagesService.toggleActive(id);
  }
}
