import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskPriority } from './entities/task.entity';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user_id: number): Promise<Task> {
    const { task, project_id, assigned_to, priority } = createTaskDto;
    const assigner_id = user_id;
    // Find the project
    const project = await this.projectRepository.findOne({
      where: { id: project_id },
      relations: ['owner'],
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${project_id} not found`);
    }

    // Check if user is the project owner
    if (project.owner.id !== user_id) {
      throw new ForbiddenException(
        'You are not allowed to create tasks for this project',
      );
    }

    // Find the assigned user
    const assignedUser = await this.userRepository.findOne({
      where: { id: assigned_to },
    });
    if (!assignedUser) {
      throw new NotFoundException(`User with ID ${assigned_to} not found`);
    }

    // Find the assigner user
    const assignerUser = await this.userRepository.findOne({
      where: { id: assigner_id },
    });
    if (!assignerUser) {
      throw new NotFoundException(`User with ID ${assigner_id} not found`);
    }

    const newTask = this.taskRepository.create({
      task,
      project,
      assignedTo: assignedUser,
      assigner: assignerUser,
      priority: priority,
    });
    return this.taskRepository.save(newTask);
  }

  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      relations: ['project', 'assignedTo'],
    });
  }

  async findByProjectId(projectId: number, user_id: number): Promise<Task[]> {
    // Check if user has access to this project
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found`);
    }

    if (project.owner.id !== user_id) {
      throw new ForbiddenException(
        'You are not allowed to view tasks for this project',
      );
    }

    return this.taskRepository.find({
      where: { project: { id: projectId } },
      relations: ['project', 'assignedTo'],
    });
  }

  async findByAssignedUser(userId: number): Promise<Task[]> {
    return this.taskRepository.find({
      where: { assignedTo: { id: userId } },
      relations: ['project', 'assignedTo'],
    });
  }

  async findOne(id: number, user_id: number): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['project', 'assignedTo', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Check if user has access to this task (project owner or assigned user)
    if (task.project.owner.id !== user_id && task.assignedTo.id !== user_id) {
      throw new ForbiddenException('You are not allowed to view this task');
    }

    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user_id: number,
  ): Promise<Task> {
    const task = await this.findOne(id, user_id);

    // Only project owner can update tasks
    if (task.project.owner.id !== user_id) {
      throw new ForbiddenException('You are not allowed to update this task');
    }

    // If updating assigned user, validate the new user exists
    if (updateTaskDto.assigned_to) {
      const newAssignedUser = await this.userRepository.findOne({
        where: { id: updateTaskDto.assigned_to },
      });
      if (!newAssignedUser) {
        throw new NotFoundException(
          `User with ID ${updateTaskDto.assigned_to} not found`,
        );
      }
      task.assignedTo = newAssignedUser;
    }

    // If updating project, validate the new project exists and user owns it
    if (updateTaskDto.project_id) {
      const newProject = await this.projectRepository.findOne({
        where: { id: updateTaskDto.project_id },
        relations: ['owner'],
      });
      if (!newProject) {
        throw new NotFoundException(
          `Project with ID ${updateTaskDto.project_id} not found`,
        );
      }
      if (newProject.owner.id !== user_id) {
        throw new ForbiddenException(
          'You are not allowed to move tasks to this project',
        );
      }
      task.project = newProject;
    }

    // Update other fields
    if (updateTaskDto.task) {
      task.task = updateTaskDto.task;
    }
    if (updateTaskDto.priority) {
      task.priority = updateTaskDto.priority;
    }

    return this.taskRepository.save(task);
  }

  async remove(id: number, user_id: number): Promise<string> {
    const task = await this.findOne(id, user_id);

    // Only project owner can delete tasks
    if (task.project.owner.id !== user_id) {
      throw new ForbiddenException('You are not allowed to delete this task');
    }

    await this.taskRepository.remove(task);
    return 'Task deleted successfully';
  }
}
