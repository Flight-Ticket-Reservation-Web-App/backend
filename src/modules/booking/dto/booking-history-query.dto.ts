import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { TicketStatus } from '@prisma/client';
import { SortOrder } from '@/common/enums/sort-order.enum';

export class BookingHistoryQueryDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
