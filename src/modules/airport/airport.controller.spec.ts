import { Test, TestingModule } from '@nestjs/testing';
import { AirportController } from './airport.controller';
import { AirportService } from './airport.service';

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
