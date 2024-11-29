import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsOptional } from 'class-validator';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
  @IsOptional()
  email?: string;
  @IsOptional()
  id?: number;
}
