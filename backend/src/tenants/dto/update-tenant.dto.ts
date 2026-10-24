import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTenantDto } from './create-tenant.dto';

export class UpdateTenantDto extends PartialType(CreateTenantDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động tiếp nhận bệnh nhân của chi nhánh',
  })
  @IsBoolean({ message: 'Trạng thái isActive phải là kiểu boolean (true/false)' })
  @IsOptional()
  isActive?: boolean;
}
