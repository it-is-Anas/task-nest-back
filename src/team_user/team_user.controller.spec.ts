import { Test, TestingModule } from '@nestjs/testing';
import { TeamUserController } from './team_user.controller';
import { TeamUserService } from './team_user.service';

describe('TeamUserController', () => {
  let controller: TeamUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamUserController],
      providers: [TeamUserService],
    }).compile();

    controller = module.get<TeamUserController>(TeamUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
