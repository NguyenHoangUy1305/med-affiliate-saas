import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsEmail } from 'class-validator';

export class ValidateVoucherDto {
  @ApiProperty({
    example: 'UY_AGU50',
    description: 'Mã Voucher giảm giá do CTV cung cấp',
  })
  @IsString({ message: 'Mã voucher phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng cung cấp mã voucher' })
  voucherCode: string;

  @ApiProperty({
    example: 'pkg-student-standard',
    description: 'ID gói khám bệnh nhân đang chọn đặt lịch',
  })
  @IsString({ message: 'ID gói khám phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng chọn gói khám y tế' })
  packageId: string;

  @ApiProperty({
    example: '0912345678',
    description: 'Số điện thoại của khách hàng/bệnh nhân (dùng để kiểm tra chống tự giới thiệu)',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại người đặt khám' })
  customerPhone: string;

  @ApiPropertyOptional({
    example: 'dth215888@agu.edu.vn',
    description: 'Email người đặt khám (bắt buộc đuôi @agu.edu.vn nếu là gói sinh viên)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Định dạng email khách hàng không hợp lệ' })
  customerEmail?: string;
}
