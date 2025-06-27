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
import { TeamUserService } from './team_user.service';
import { CreateTeamUserDto } from './dto/create-team_user.dto';
import { UpdateTeamUserDto } from './dto/update-team_user.dto';
import { JwtAuthGuard } from '../user/jwt-auth.guard';

@Controller('team-user')
@UseGuards(JwtAuthGuard)
export class TeamUserController {
  constructor(private readonly teamUserService: TeamUserService) {}

  @Post()
  create(@Body() createTeamUserDto: CreateTeamUserDto, @Request() req) {
    return this.teamUserService.create(createTeamUserDto, req.user.sub);
  }

  @Get()
  findAll() {
    return this.teamUserService.findAll();
  }

  @Get('team/:teamId')
  findByTeam(@Param('teamId') teamId: string) {
    return this.teamUserService.findByTeam(+teamId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.teamUserService.findByUser(+userId);
  }

  @Get('my-teams')
  findMyTeams(@Request() req) {
    return this.teamUserService.findByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamUserService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTeamUserDto: UpdateTeamUserDto,
  ) {
    return this.teamUserService.update(+id, updateTeamUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamUserService.remove(+id);
  }
}
