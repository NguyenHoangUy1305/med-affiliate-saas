import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MedicalPackagesService } from './medical-packages.service';

@ApiTags('Commission Tiers & Chính Sách Hoa Hồng')
@Controller('commission-tiers')
export class CommissionTiersController {
  constructor(private readonly packagesService: MedicalPackagesService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách các bậc hoa hồng mẫu của hệ thống',
    description: 'Công khai: Dành cho Cộng tác viên và Đối tác xem trước cơ chế tính thưởng hoa hồng lũy tiến theo số đơn hàng đạt được trong tháng.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách các bậc hoa hồng thành công (Đồng: 10%, Bạc: 12%, Vàng: 15%)',
  })
  async getCommissionTiers() {
    return this.packagesService.getCommissionTiers();
  }
}
