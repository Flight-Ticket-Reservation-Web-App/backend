import { Test, TestingModule } from '@nestjs/testing';
import { AirportController } from '@/modules/airport/airport.controller';
import { AirportService } from '@/modules/airport/airport.service';

describe('AirportController', () => {
  let controller: AirportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirportController],
      providers: [AirportService],
    }).compile();

    controller = module.get<AirportController>(AirportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
