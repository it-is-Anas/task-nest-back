import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('team') 
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Body() createTeamDto: CreateTeamDto, @Request() req) {
    return this.teamService.create(createTeamDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.teamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTeamDto: UpdateTeamDto, @Request() req) {
    return this.teamService.update(+id, updateTeamDto, req.user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamService.remove(+id);
  }
}
