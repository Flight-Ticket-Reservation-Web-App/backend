import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NewsCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateNewsDto {
  @ApiProperty({ description: 'Title of the news' })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'Subtitle of the news' })
  @IsString({ message: 'Subtitle must be a string' })
  @IsNotEmpty({ message: 'Subtitle is required' })
  subtitle: string;

  @ApiProperty({ description: 'Content of the news' })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @ApiProperty({ description: 'Category of the news' })
  @IsEnum(NewsCategory, { message: 'Category must be a valid NewsCategory' })
  @IsNotEmpty({ message: 'Category is required' })
  category: NewsCategory;

  @ApiProperty({ description: 'Thumbnail URL of the news' })
  @IsString({ message: 'Thumbnail must be a string' })
  @IsNotEmpty({ message: 'Thumbnail is required' })
  thumbnail: string;

  @ApiProperty({ description: 'User ID who created the news' })
  @IsNotEmpty({ message: 'User ID is required' })
  @Type(() => Number)
  adminId: number;
}
