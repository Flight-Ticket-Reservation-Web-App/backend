import { Test, TestingModule } from '@nestjs/testing';
import { FlightController } from '@/modules/flight/flight.controller';
import { FlightService } from '@/modules/flight/flight.service';

describe('FlightController', () => {
  let controller: FlightController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlightController],
      providers: [FlightService],
    }).compile();

    controller = module.get<FlightController>(FlightController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
