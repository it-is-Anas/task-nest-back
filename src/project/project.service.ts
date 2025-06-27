import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project, ProjectStatus } from './entities/project.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createProjectDto: CreateProjectDto,
    user_id: number,
  ): Promise<Project> {
    const { name, project_status } = createProjectDto;

    // Find the user (owner)
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} not found`);
    }

    const project = this.projectRepository.create({
      name,
      owner: user,
      project_status: project_status || ProjectStatus.IN_QUEUE,
    });

    return this.projectRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: ['owner'],
    });
  }

  async findByUserId(userId: number): Promise<Project[]> {
    return this.projectRepository.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
  }

  async findOne(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
    user_id: number,
  ): Promise<Project> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (project.owner.id !== user_id) {
      throw new ForbiddenException(
        'You are not allowed to update this project',
      );
    }
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async updateStatus(id: number, status: string): Promise<Project> {
    const project = await this.findOne(id);

    // Validate the status
    if (!Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      throw new NotFoundException(`Invalid project status: ${status}`);
    }

    project.project_status = status as ProjectStatus;
    return this.projectRepository.save(project);
  }

  async remove(id: number, user_id: number): Promise<string> {
    const project = await this.findOne(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }
    if (project.owner.id !== user_id) {
      throw new ForbiddenException(
        'You are not allowed to delete this project',
      );
    }
    await this.projectRepository.remove(project);
    return 'project deleted successfully';
  }
}
