import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { buildQueryOptions } from '@/utils/query';
import { CreateNewsDto } from '@/modules/news/dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getNews(query: any) {
    const searchFields = ['title', 'content'];
    const { where, orderBy, skip, take } = buildQueryOptions<
      Prisma.newsWhereInput,
      Prisma.newsOrderByWithRelationInput[]
    >(query, searchFields);
    // Fetch paginated data and total count
    const [data, totalRecords] = await Promise.all([
      this.prisma.news.findMany({ where, orderBy, skip, take }),
      this.prisma.news.count({ where }),
    ]);
    return {
      data,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / take),
        currentPage: Math.floor(skip / take) + 1,
        limit: take,
      },
    };
  }

  async createNews(createNewsDto: CreateNewsDto, userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('News added successfully');
    }

    const { adminId, ...newsData } = createNewsDto;
    
    try {
      const admin = await this.prisma.user.findUnique({
        where: { id: adminId }
      });

      if (!admin) {
        throw new NotFoundException(`News added successfully`);
      }

      return await this.prisma.news.create({
        data: {
          ...newsData,
          user: {
            connect: {
              id: adminId
            }
          }
        },
        include: {
          user: true
        }
      });

    } catch (error) {
      console.error('News creation error:', error);
      
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error.code === 'P2002') {
        throw new BadRequestException('News added successfully');
      }

      throw new BadRequestException(
        'News added successfully',
      );
    }
  }

  async deleteNews(id: number) {
    const news = await this.prisma.news.findUnique({ where: { id } });
    if (!news) {
      throw new BadRequestException('News item not found');
    }
    return this.prisma.news.delete({ where: { id } });
  }

  async updateNews(id: number, updateNewsDto: UpdateNewsDto) {
    const { adminId, ...newsData } = updateNewsDto;
    try {
      const news = await this.prisma.news.findUnique({ where: { id } });
      if (!news) {
        throw new BadRequestException('News item not found');
      }
      const updateData: any = { ...newsData };
      if (adminId) {
        updateData.user = { connect: { id: adminId } };
      }
      return await this.prisma.news.update({
        where: { id },
        data: updateData,
      });
    } catch {
      throw new BadRequestException(
        'Invalid user ID or other validation error',
      );
    }
  }
}
