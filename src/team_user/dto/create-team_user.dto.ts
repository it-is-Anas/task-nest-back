import { IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTeamUserDto {
  @IsNumber()
  @IsNotEmpty()
  team_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;
}
