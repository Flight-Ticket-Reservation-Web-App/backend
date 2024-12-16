import { IsEmail, IsNotEmpty } from 'class-validator';

export class CheckAdminEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
