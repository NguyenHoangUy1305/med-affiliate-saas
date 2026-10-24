import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class QueryOrdersDto {
  @ApiPropertyOptional({ default: 1, minimum: 1, description: 'Số trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100, description: 'Số đơn mỗi trang' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: OrderStatus,
    description: 'Lọc theo trạng thái đơn: PENDING, CONFIRMED, COMPLETED, CANCELLED',
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Lọc theo cơ sở y tế (chỉ Super Admin)' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Tìm kiếm theo Mã phiếu khám, Số điện thoại hoặc Tên bệnh nhân',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
