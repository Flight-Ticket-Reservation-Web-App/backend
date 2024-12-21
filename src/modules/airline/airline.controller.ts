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
  ConflictException,
  HttpException,
  NotFoundException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AirlineService } from './airline.service';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Roles } from '@/auth/role/role.decorator';
import { RoleGuard } from '@/auth/role/role.guard';
import { Role } from '@/common/enums';

@UseGuards(RoleGuard)
@Roles(Role.ADMIN)
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
      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      } else if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      } else {
        throw new HttpException(
          error.message,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
