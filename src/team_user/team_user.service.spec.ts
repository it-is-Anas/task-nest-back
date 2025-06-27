import { Test, TestingModule } from '@nestjs/testing';
import { TeamUserService } from './team_user.service';

describe('TeamUserService', () => {
  let service: TeamUserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamUserService],
    }).compile();

    service = module.get<TeamUserService>(TeamUserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
