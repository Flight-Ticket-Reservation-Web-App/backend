import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from '@/modules/news/news.service';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';
import { NewsCategory } from '@prisma/client';
import { Roles } from '@/auth/role/role.decorator';
import { Role } from '@/common/enums/role.enum';
import { RoleGuard } from '@/auth/role/role.guard';

@UseGuards(RoleGuard)
@Roles(Role.ADMIN)
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  async getNews(
    @Query() paginationDto: PaginationDto,
    @Query('category') category?: NewsCategory,
  ) {
    return this.newsService.getNews({
      ...paginationDto,
      category,
    });
  }

  @Post()
  async createNews(@Body() createNewsDto: CreateNewsDto, @Req() req) {
    const userRole = req.user.role;
    return this.newsService.createNews(createNewsDto, userRole);
  }
}
