import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsOptional()
  email?: string;
  @IsOptional()
  id?: number;
}

export class ChangePassAuthDto extends PartialType(CreateAuthDto) {
  @IsNotEmpty()
  code: string;
  @IsNotEmpty()
  newPassword: string;
  @IsNotEmpty()
  email: string;
}
