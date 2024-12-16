import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Limit must be at least 1' })
  limit?: number = 100;

  @IsOptional()
  @IsString()
  sortBy?: string = 'updated_at';

  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'sortOrder must be "asc" or "desc"',
  })
  sortOrder?: string = 'desc';
}
