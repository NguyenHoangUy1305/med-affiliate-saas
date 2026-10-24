import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterPartnerDto {
  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên đầy đủ của Cộng tác viên',
  })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @ApiProperty({
    example: 'nguyenvana@gmail.com',
    description: 'Địa chỉ email đăng ký tài khoản CTV',
  })
  @IsEmail({}, { message: 'Email không đúng định dạng hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @ApiProperty({
    example: '0988123456',
    description: 'Số điện thoại liên lạc của CTV (10 chữ số chuẩn Việt Nam)',
  })
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^(0|84)(3|5|7|8|9)[0-9]{8}$/, {
    message: 'Số điện thoại không đúng định dạng hợp lệ tại Việt Nam (10 chữ số)',
  })
  phone: string;

  @ApiProperty({
    example: 'MedSaas@2026',
    description: 'Mật khẩu bảo mật cho tài khoản (tối thiểu 6 ký tự)',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}
