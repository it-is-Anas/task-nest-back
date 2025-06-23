import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { Project } from '../project/entities/project.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
 
  async create(createTeamDto: CreateTeamDto, leader_id: number): Promise<Team> {
    const { name, project_id } = createTeamDto;
    const project = await this.projectRepository.findOne({ where: { id: project_id } });
    if (!project) throw new NotFoundException(`Project with ID ${project_id} not found`);
    const leader = await this.userRepository.findOne({ where: { id: leader_id } });
    if (!leader) throw new NotFoundException(`User with ID ${leader_id} not found`);
    const team = this.teamRepository.create({ name, project, leader });
    return this.teamRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamRepository.find({ relations: ['project', 'leader'] });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamRepository.findOne({ where: { id }, relations: ['project', 'leader'] });
    if (!team) throw new NotFoundException(`Team with ID ${id} not found`);
    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto,user_id:number): Promise<Team> {
    const team = await this.findOne(id);
    if(team.leader.id !== user_id) throw new ForbiddenException('You are not authorized to update this team');
    
    if (updateTeamDto.project_id) {
      const project = await this.projectRepository.findOne({ where: { id: updateTeamDto.project_id } });
      if (!project) throw new NotFoundException(`Project with ID ${updateTeamDto.project_id} not found`);
      team.project = project;
    }
    
    if (updateTeamDto.name) {
      team.name = updateTeamDto.name;
    }
    return this.teamRepository.save(team);
  }

  async remove(id: number): Promise<string> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
    return 'Team deleted successfully';
  }
}
