import { PartialType } from '@nestjs/mapped-types';
import { CreateContentAnalysisDto } from './create-content-analysis.dto';

export class UpdateContentAnalysisDto extends PartialType(CreateContentAnalysisDto) {}
