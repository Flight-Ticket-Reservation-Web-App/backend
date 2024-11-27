import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import Groq from 'groq-sdk';
import Redis from 'ioredis';
import { CategoryAnalysisDto } from './dto/category-analysis.dto';

@Injectable()
export class ContentAnalysisService {
  private readonly CACHE_KEY = 'daily_categories_analysis';
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 hours
  private readonly logger = new Logger(ContentAnalysisService.name);
  private client: Groq;

  constructor(
    private prisma: PrismaService,
    private readonly redis: Redis,
  ) {
    this.client = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async analyzeDailyCategories(): Promise<CategoryAnalysisDto[]> {
    try {
      // Check cache first
      const cached = await this.redis.get(this.CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }

      const todayContent = await this.prisma.$queryRaw<
        Array<{ categories: string; content: string }>
      >`
        SELECT categories, content 
        FROM website_content 
        WHERE DATE(created_at) = CURRENT_DATE;
      `;

      const analysis = await this.analyzeWithGroq(todayContent);

      await this.redis.set(
        this.CACHE_KEY,
        JSON.stringify(analysis),
        'EX',
        this.CACHE_TTL,
      );

      return analysis;
    } catch (error) {
      this.logger.error('Error analyzing daily categories:', error);
      throw error;
    }
  }

  private async analyzeWithGroq(
    content: Array<{ categories: string; content: string }>,
  ): Promise<CategoryAnalysisDto[]> {
    const contentText = content
      .map((item) => `Categories: ${item.categories}\nContent: ${item.content}`)
      .join('\n\n');

    const chatCompletion = await this.client.chat.completions.create({
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
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 500,
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || '[]');
  }
}
