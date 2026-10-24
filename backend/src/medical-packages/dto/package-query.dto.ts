import { ApiPropertyOptional } from '@nestjs/swagger';
import { TargetAudience } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class PackageQueryDto {
  @ApiPropertyOptional({
    enum: TargetAudience,
    description: 'Lọc theo đối tượng áp dụng (ALL hoặc STUDENT_ONLY)',
  })
  @IsEnum(TargetAudience)
  @IsOptional()
  targetAudience?: TargetAudience;

  @ApiPropertyOptional({
    example: 'sinh viên',
    description: 'Từ khóa tìm kiếm theo tên, mã gói hoặc mô tả',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'true',
    description: 'Nếu là true chỉ lấy các gói đang kích hoạt hiển thị',
  })
  @IsString()
  @IsOptional()
  onlyActive?: string;

  @ApiPropertyOptional({
    example: 'price_asc',
    enum: ['price_asc', 'price_desc', 'newest'],
    description: 'Thứ tự sắp xếp: giá tăng dần, giá giảm dần hoặc mới nhất',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
}
