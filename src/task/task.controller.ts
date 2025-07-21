import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post() //ok
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.taskService.create(createTaskDto, req.user.sub);
  }

  @Get('/:projectId') //ok
  findAll(@Param('projectId') projectId: string) {
    return this.taskService.findAll(projectId);
  }

  @Get('project/:projectId')
  findByProjectId(@Param('projectId') projectId: string, @Request() req) {
    return this.taskService.findByProjectId(+projectId, req.user.sub);
  }

  @Get('assigned')
  findByAssignedUser(@Request() req) {
    return this.taskService.findByAssignedUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.taskService.findOne(+id, req.user.sub);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.taskService.update(+id, updateTaskDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.taskService.remove(+id, req.user.sub);
  }
}
