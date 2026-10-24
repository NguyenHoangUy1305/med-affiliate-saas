import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TargetAudience } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({
    example: 'MED-SV-01',
    description: 'Mã gói khám duy nhất (viết hoa không dấu)',
  })
  @IsString({ message: 'Mã gói khám phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã gói khám không được để trống' })
  @MaxLength(50, { message: 'Mã gói khám tối đa 50 ký tự' })
  code: string;

  @ApiProperty({
    example: 'Gói Khám Sức Khỏe Sinh Viên Đại Học An Giang',
    description: 'Tên hiển thị đầy đủ của gói khám',
  })
  @IsString({ message: 'Tên gói khám phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên gói khám không được để trống' })
  @MaxLength(255, { message: 'Tên gói khám tối đa 255 ký tự' })
  name: string;

  @ApiProperty({
    example: 'kham-suc-khoe-sinh-vien-agu',
    description: 'Đường dẫn thân thiện URL phục vụ tối ưu SEO (slug duy nhất)',
  })
  @IsString({ message: 'Slug phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Slug không được để trống' })
  @MaxLength(255, { message: 'Slug tối đa 255 ký tự' })
  slug: string;

  @ApiProperty({
    example: 350000,
    description: 'Giá niêm yết gốc trước khi giảm (VNĐ)',
  })
  @IsNumber({}, { message: 'Giá gốc phải là số' })
  @Min(0, { message: 'Giá gốc không được âm' })
  originalPrice: number;

  @ApiProperty({
    example: 199000,
    description: 'Giá bán thực tế cho người đặt (VNĐ)',
  })
  @IsNumber({}, { message: 'Giá bán phải là số' })
  @Min(0, { message: 'Giá bán không được âm' })
  price: number;

  @ApiPropertyOptional({
    example: 'Gói khám toàn diện dành riêng cho sinh viên AGU với đầy đủ danh mục khám và xét nghiệm chuẩn.',
    description: 'Mô tả chi tiết tổng quan về gói khám',
  })
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: {
      items: [
        'Khám nội khoa tổng quát & đo sinh hiệu',
        'Kiểm tra thị lực mắt & đo khúc xạ',
        'Chụp X-quang tim phổi thẳng kỹ thuật số',
        'Xét nghiệm tổng phân tích tế bào máu (24 thông số)',
      ],
    },
    description: 'Dữ liệu JSON chi tiết các danh mục xét nghiệm/chụp chiếu trong gói',
  })
  @IsOptional()
  details?: Record<string, any>;

  @ApiPropertyOptional({
    enum: TargetAudience,
    example: TargetAudience.STUDENT_ONLY,
    description: 'Đối tượng mục tiêu áp dụng: ALL (Tất cả) hoặc STUDENT_ONLY (Chỉ sinh viên)',
  })
  @IsEnum(TargetAudience, { message: 'targetAudience phải là ALL hoặc STUDENT_ONLY' })
  @IsOptional()
  targetAudience?: TargetAudience;
}
