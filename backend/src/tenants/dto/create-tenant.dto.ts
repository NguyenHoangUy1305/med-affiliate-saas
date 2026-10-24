import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';

export class CreateTenantDto {
  @ApiProperty({
    example: 'BV-AG-LX',
    description: 'Mã định danh duy nhất của cơ sở y tế (viết hoa, không dấu, tối đa 20 ký tự)',
  })
  @IsString({ message: 'Mã chi nhánh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mã chi nhánh không được để trống' })
  @MaxLength(20, { message: 'Mã chi nhánh không được vượt quá 20 ký tự' })
  code: string;

  @ApiProperty({
    example: 'Bệnh viện Đa khoa Trung tâm An Giang',
    description: 'Tên đầy đủ của bệnh viện hoặc phòng khám',
  })
  @IsString({ message: 'Tên chi nhánh phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Tên chi nhánh không được để trống' })
  @MaxLength(255, { message: 'Tên chi nhánh không được vượt quá 255 ký tự' })
  name: string;

  @ApiProperty({
    example: '60 Ung Văn Khiêm, P. Mỹ Phước, TP. Long Xuyên, Tỉnh An Giang',
    description: 'Địa chỉ thực tế của cơ sở y tế',
  })
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @MaxLength(500, { message: 'Địa chỉ không được vượt quá 500 ký tự' })
  address: string;

  @ApiProperty({
    example: '02963834646',
    description: 'Số điện thoại đường dây nóng hoặc tổng đài tiếp đón',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{10,11}$/, {
    message: 'Số điện thoại liên hệ phải có 10 đến 11 chữ số',
  })
  phone: string;
}
