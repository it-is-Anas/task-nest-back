import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamUserDto } from './dto/create-team_user.dto';
import { UpdateTeamUserDto } from './dto/update-team_user.dto';
import { TeamUser } from './entities/team_user.entity';
import { Team } from '../team/entities/team.entity';
import { User } from '../user/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';

@Injectable()
export class TeamUserService {
  constructor(
    @InjectRepository(TeamUser)
    private teamUserRepository: Repository<TeamUser>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(
    createTeamUserDto: CreateTeamUserDto,
    userId: number,
  ): Promise<TeamUser> {
    const { team_id, user_id } = createTeamUserDto;

    // Check if team exists
    const team = await this.teamRepository.findOne({
      where: { id: team_id },
      relations: { leader: true, project: true },
    });
    if (!team) {
      throw new NotFoundException(`Team with ID ${team_id} not found`);
    }

    const project = await this.projectRepository.findOne({
      where: { id: team?.project?.id },
      relations: { owner: true },
    });
    if (project?.owner.id !== userId)
      throw new ForbiddenException(
        'You are not authorized to add this user to this team',
      );
    if (!project) {
      throw new NotFoundException(
        `Project with ID ${team?.project?.id} not found`,
      );
    }

    // Check if user exists
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    // Check if user is already in the team
    const existingTeamUser = await this.teamUserRepository.findOne({
      where: { team: { id: team_id }, user: { id: user_id } },
    });

    if (existingTeamUser) {
      throw new ConflictException('User is already a member of this team');
    }

    const teamUser = this.teamUserRepository.create({
      team,
      user,
    });

    return this.teamUserRepository.save(teamUser);
  }

  async findAll(): Promise<TeamUser[]> {
    return this.teamUserRepository.find({
      relations: ['team', 'user'],
    });
  }

  async findOne(id: number): Promise<TeamUser> {
    const teamUser = await this.teamUserRepository.findOne({
      where: { id },
      relations: ['team', 'user'],
    });

    if (!teamUser) {
      throw new NotFoundException(`TeamUser with ID ${id} not found`);
    }

    return teamUser;
  }

  async update(
    id: number,
    updateTeamUserDto: UpdateTeamUserDto,
  ): Promise<TeamUser> {
    const teamUser = await this.findOne(id);

    if (updateTeamUserDto.team_id) {
      const team = await this.teamRepository.findOne({
        where: { id: updateTeamUserDto.team_id },
      });
      if (!team) {
        throw new NotFoundException(
          `Team with ID ${updateTeamUserDto.team_id} not found`,
        );
      }
      teamUser.team = team;
    }

    if (updateTeamUserDto.user_id) {
      const user = await this.userRepository.findOne({
        where: { id: updateTeamUserDto.user_id },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateTeamUserDto.user_id} not found`,
        );
      }
      teamUser.user = user;
    }

    return this.teamUserRepository.save(teamUser);
  }

  async remove(id: number): Promise<string> {
    const teamUser = await this.findOne(id);
    await this.teamUserRepository.remove(teamUser);
    return 'TeamUser deleted successfully';
  }

  async findByTeam(teamId: number): Promise<TeamUser[]> {
    return this.teamUserRepository.find({
      where: { team: { id: teamId } },
      relations: ['user'],
    });
  }

  async findByUser(userId: number): Promise<TeamUser[]> {
    return this.teamUserRepository.find({
      where: { user: { id: userId } },
      relations: ['team'],
    });
  }
}
