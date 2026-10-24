import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVoucherDto {
  @ApiProperty({
    example: 'UY_AGU50',
    description: 'Mã Voucher cá nhân của CTV (viết hoa không dấu, chỉ gồm chữ cái, số hoặc gạch dưới, tối đa 50 ký tự)',
  })
  @IsString({ message: 'Mã voucher phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã voucher không được để trống' })
  @MaxLength(50, { message: 'Mã voucher tối đa 50 ký tự' })
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Mã voucher chỉ được chứa chữ in hoa (A-Z), chữ số (0-9) và dấu gạch dưới (_)',
  })
  code: string;

  @ApiProperty({
    example: 20000,
    description: 'Số tiền giảm trực tiếp cho khách hàng khi đặt khám bằng mã này (VNĐ)',
  })
  @IsNumber({}, { message: 'Số tiền giảm giá phải là số' })
  @Min(1000, { message: 'Số tiền giảm giá tối thiểu là 1.000 VNĐ' })
  discountValue: number;

  @ApiPropertyOptional({
    example: 100,
    default: 100,
    description: 'Số lượt sử dụng tối đa cho phép của mã Voucher này',
  })
  @IsInt({ message: 'Số lượt dùng tối đa phải là số nguyên' })
  @Min(1, { message: 'Số lượt dùng tối đa phải từ 1 trở lên' })
  @IsOptional()
  maxUsage?: number;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
    description: 'Thời hạn hết hạn của mã (định dạng ISO 8601, nếu không điền thì vô thời hạn)',
  })
  @IsDateString({}, { message: 'Hạn sử dụng phải là chuỗi ngày tháng ISO hợp lệ' })
  @IsOptional()
  expiryDate?: string;
}
