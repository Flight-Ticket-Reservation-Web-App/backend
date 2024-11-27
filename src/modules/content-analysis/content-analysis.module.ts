import { Module } from '@nestjs/common';
import { ContentAnalysisService } from './content-analysis.service';
import { ContentAnalysisController } from './content-analysis.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { RedisModule } from '@nestjs/redis';

@Module({
  imports: [
    PrismaModule,
    RedisModule.forRoot({
      config: {
        url: process.env.REDIS_URL,
      },
    }),
  ],
  controllers: [ContentAnalysisController],
  providers: [ContentAnalysisService],
})
export class ContentAnalysisModule {}
