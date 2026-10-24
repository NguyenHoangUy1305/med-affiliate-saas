import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@ApiTags('Tenants & Chi Nhánh Y Tế')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các chi nhánh bệnh viện / phòng khám',
    description: 'Công khai: Dùng cho bệnh nhân và sinh viên lựa chọn cơ sở y tế gần nhất khi đặt lịch khám trực tuyến.',
  })
  @ApiQuery({
    name: 'onlyActive',
    required: false,
    type: Boolean,
    description: 'Nếu là true chỉ lấy các chi nhánh đang hoạt động mở cửa',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách chi nhánh thành công' })
  async findAll(@Query('onlyActive') onlyActive?: string) {
    const isOnlyActive = onlyActive === 'true';
    return this.tenantsService.findAll(isOnlyActive);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Xem chi tiết thông tin một chi nhánh y tế',
    description: 'Công khai: Trả về tên, địa chỉ, số điện thoại và số lượng đơn khám của chi nhánh.',
  })
  @ApiResponse({ status: 200, description: 'Tìm thấy chi nhánh thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  async findOne(@Param('id') id: string) {
    return this.tenantsService.findOne(id);
  }

  @Post()
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Tạo mới một chi nhánh y tế liên kết (Chỉ Super Admin)',
    description: 'Yêu cầu quyền SUPER_ADMIN. Nhập mã định danh chi nhánh, tên, địa chỉ và số điện thoại.',
  })
  @ApiResponse({ status: 201, description: 'Tạo chi nhánh mới thành công' })
  @ApiResponse({ status: 409, description: 'Mã chi nhánh đã tồn tại' })
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Patch(':id')
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Cập nhật thông tin chi nhánh (Chỉ Super Admin)',
    description: 'Yêu cầu quyền SUPER_ADMIN. Cập nhật tên, địa chỉ, số hotline hoặc mã chi nhánh.',
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Patch(':id/toggle-active')
  @Auth(Role.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Đổi trạng thái hoạt động của chi nhánh (Chỉ Super Admin)',
    description: 'Yêu cầu quyền SUPER_ADMIN. Đổi qua lại giữa Đang hoạt động (true) và Tạm ngừng (false).',
  })
  @ApiResponse({ status: 200, description: 'Đổi trạng thái thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy chi nhánh' })
  async toggleActive(@Param('id') id: string) {
    return this.tenantsService.toggleActive(id);
  }
}
