import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  IsISO8601,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({
    example: 'Nguyễn Văn An',
    description: 'Họ và tên bệnh nhân đặt lịch khám',
  })
  @IsString({ message: 'Họ và tên bệnh nhân phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên bệnh nhân' })
  patientName: string;

  @ApiProperty({
    example: '0988776655',
    description: 'Số điện thoại liên hệ của bệnh nhân',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng nhập số điện thoại bệnh nhân' })
  patientPhone: string;

  @ApiPropertyOptional({
    example: 'dth215888@agu.edu.vn',
    description:
      'Email bệnh nhân (bắt buộc đuôi @agu.edu.vn nếu đặt gói khám ưu đãi sinh viên)',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Định dạng email bệnh nhân không hợp lệ' })
  patientEmail?: string;

  @ApiProperty({
    example: 'tenant-ag-lx',
    description: 'ID cơ sở y tế / Bệnh viện / Phòng khám tại An Giang',
  })
  @IsString({ message: 'ID chi nhánh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng chọn cơ sở y tế khám' })
  tenantId: string;

  @ApiProperty({
    example: 'pkg-student-standard',
    description: 'ID gói khám sức khỏe bệnh nhân lựa chọn',
  })
  @IsString({ message: 'ID gói khám phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Vui lòng chọn gói khám y tế' })
  packageId: string;

  @ApiProperty({
    example: '2026-10-28T08:30:00.000Z',
    description: 'Ngày hẹn đến khám tại cơ sở y tế (định dạng ISO 8601)',
  })
  @IsISO8601({}, { message: 'Ngày hẹn khám phải theo định dạng ngày giờ chuẩn ISO 8601' })
  @IsNotEmpty({ message: 'Vui lòng chọn ngày hẹn khám' })
  appointmentDate: string;

  @ApiPropertyOptional({
    example: 'UY_AGU50',
    description: 'Mã voucher ưu đãi giảm giá từ Cộng tác viên (nếu có)',
  })
  @IsOptional()
  @IsString({ message: 'Mã voucher phải là chuỗi ký tự' })
  voucherCode?: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    default: PaymentMethod.AT_COUNTER,
    example: PaymentMethod.AT_COUNTER,
    description: 'Phương thức thanh toán: AT_COUNTER, WALLET, VIETQR',
  })
  @IsOptional()
  @IsEnum(PaymentMethod, {
    message: 'Phương thức thanh toán không hợp lệ (AT_COUNTER, WALLET, VIETQR)',
  })
  paymentMethod?: PaymentMethod;
}
