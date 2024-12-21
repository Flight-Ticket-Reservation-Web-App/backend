import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { AirlineService } from './airline.service';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@Controller('airline')
export class AirlineController {
  constructor(private readonly airlineService: AirlineService) {}

  @Post()
  create(@Body() createAirlineDto: CreateAirlineDto) {
    return this.airlineService.create(createAirlineDto);
  }

  @Get()
  findAll(
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    queryParams: PaginationDto,
  ) {
    return this.airlineService.findAll(queryParams);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.airlineService.findOne(+id);
  // }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAirlineDto: UpdateAirlineDto,
  ) {
    try {
      return await this.airlineService.update(id, updateAirlineDto);
    } catch (error) {
      return { error: error.message };
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.airlineService.remove(id);
    } catch (error) {
      return { error: error.message };
    }
  }
}
