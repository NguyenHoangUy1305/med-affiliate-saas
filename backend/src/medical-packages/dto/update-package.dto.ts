import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreatePackageDto } from './create-package.dto';

export class UpdatePackageDto extends PartialType(CreatePackageDto) {
  @ApiPropertyOptional({
    example: true,
    description: 'Trạng thái hoạt động hiển thị gói khám trên Storefront',
  })
  @IsBoolean({ message: 'isActive phải là kiểu boolean (true/false)' })
  @IsOptional()
  isActive?: boolean;
}
