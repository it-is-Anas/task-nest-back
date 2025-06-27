import { PartialType } from '@nestjs/mapped-types';
import { CreateTeamUserDto } from './create-team_user.dto';

export class UpdateTeamUserDto extends PartialType(CreateTeamUserDto) {}
