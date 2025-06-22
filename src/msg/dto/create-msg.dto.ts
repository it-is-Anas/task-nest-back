import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateMsgDto {
  @IsString()
  msg: string;

  @IsOptional()
  @IsBoolean()
  seen?: boolean;

  @IsOptional()
  @IsBoolean()
  delivered?: boolean;

  @IsNumber()
  to: string;
}
