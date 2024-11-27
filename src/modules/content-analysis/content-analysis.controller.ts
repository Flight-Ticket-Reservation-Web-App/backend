import { Controller, Get } from '@nestjs/common';
import { ContentAnalysisService } from './content-analysis.service';
import { CategoryAnalysisDto } from './dto/category-analysis.dto';

@Controller('content-analysis')
export class ContentAnalysisController {
  constructor(
    private readonly contentAnalysisService: ContentAnalysisService,
  ) {}

  @Get('daily-categories')
  async getDailyCategories(): Promise<CategoryAnalysisDto[]> {
    return this.contentAnalysisService.analyzeDailyCategories();
  }
}
