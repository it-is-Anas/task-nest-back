import { IsString, IsNumber } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsNumber()
  project_id: number;

}
