import { IsEmail, IsEmpty, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmpty()
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @IsEmpty()
  password: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  role?: string;
}
