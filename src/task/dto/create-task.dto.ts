import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @IsString()
  task: string;

  @IsNumber()
  project_id: number;

  @IsNumber()
  assigned_to: number;


  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
