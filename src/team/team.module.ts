import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { Team } from './entities/team.entity';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Project, User]), UserModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
