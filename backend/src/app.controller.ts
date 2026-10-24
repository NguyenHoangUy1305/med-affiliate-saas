import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health & System')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Kiểm tra trạng thái máy chủ gốc' })
  @ApiResponse({ status: 200, description: 'Trả về thông điệp chào mừng hệ thống' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra sức khỏe hệ sinh thái & kết nối CSDL MySQL' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo trạng thái máy chủ, uptime và kết nối CSDL MySQL qua Prisma',
  })
  async getHealth() {
    return this.appService.getHealthStatus();
  }
}
