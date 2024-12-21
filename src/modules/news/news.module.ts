import { Module } from '@nestjs/common';
import { NewsService } from '@/modules/news/news.service';
import { NewsController } from '@/modules/news/news.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [NewsController],
  providers: [NewsService, PrismaService],
})
export class NewsModule {}
