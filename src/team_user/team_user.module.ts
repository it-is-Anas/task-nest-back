import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamUserService } from './team_user.service';
import { TeamUserController } from './team_user.controller';
import { TeamUser } from './entities/team_user.entity';
import { Team } from '../team/entities/team.entity';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamUser, Team, User, Project]),
    UserModule,
  ],
  controllers: [TeamUserController],
  providers: [TeamUserService],
})
export class TeamUserModule {}
