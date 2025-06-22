import { Test, TestingModule } from '@nestjs/testing';
import { MsgController } from './msg.controller';
import { MsgService } from './msg.service';

describe('MsgController', () => {
  let controller: MsgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MsgController],
      providers: [MsgService],
    }).compile();

    controller = module.get<MsgController>(MsgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
