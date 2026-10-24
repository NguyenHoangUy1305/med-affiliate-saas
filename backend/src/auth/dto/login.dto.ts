import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'nguyenhoanguy@medsaas.vn',
    description: 'Địa chỉ email đăng nhập của người dùng',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: 'MedSaas@2026',
    description: 'Mật khẩu tài khoản (tối thiểu 6 ký tự)',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
