import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Groq } from 'groq-sdk';
import { Redis } from 'nestjs-redis';
import { CategoryAnalysisDto } from './dto/category-analysis.dto';

@Injectable()
export class ContentAnalysisService {
  private readonly CACHE_KEY = 'daily_categories_analysis';
  private groq: Groq;
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 hours

  constructor(
    private prisma: PrismaService,
    private readonly redis: Redis,
  ) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async analyzeDailyCategories(): Promise<CategoryAnalysisDto[]> {
    // Check cache first
    const cached = await this.redis.get(this.CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    const todayContent = await this.prisma.$queryRaw`
      SELECT categories, content 
      FROM website_content 
      WHERE DATE(created_at) = CURRENT_DATE;
    `;

    const analysis = await this.analyzeWithGroq(todayContent as any[]);

    await this.redis.set(
      this.CACHE_KEY,
      JSON.stringify(analysis),
      'EX',
      this.CACHE_TTL,
    );

    return analysis;
  }

  private async analyzeWithGroq(
    content: any[],
  ): Promise<CategoryAnalysisDto[]> {
    const contentText = content
      .map(
        (item: any) =>
          `Categories: ${item.categories}\nContent: ${item.content}`,
      )
      .join('\n\n');

    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Analyze the following website content and determine the most accessed categories today. Return as JSON array with category, count and lastAnalyzed fields.',
        },
        {
          role: 'user',
          content: contentText,
        },
      ],
      model: 'mixtral-8x7b-32768',
    });

    return JSON.parse(completion.choices[0]?.message?.content || '[]');
  }
}
