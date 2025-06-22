import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

@Controller('project')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    // Set the user_id from the authenticated user's JWT token
    const projectData = {
      ...createProjectDto,
      user_id: req.user.sub
    };

    return this.projectService.create(projectData, req.user.sub);
  }

  @Get()
  findAll() {
    return this.projectService.findAll();
  }

  @Get('my-projects')
  findMyProjects(@Request() req) {
    return this.projectService.findByUserId(req.user.sub);
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string) {
    return this.projectService.findByUserId(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Request() req, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectService.update(+id, updateProjectDto, req.user.sub);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { project_status: string }) {
    return this.projectService.updateStatus(+id, body.project_status);
  }

  @Delete(':id')
  remove(@Param('id') id: string,@Request() req) {
    return this.projectService.remove(+id , req.user.sub);
  }
}
