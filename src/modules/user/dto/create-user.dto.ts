import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsStrongPassword,
  IsNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: string = 'user';
}
