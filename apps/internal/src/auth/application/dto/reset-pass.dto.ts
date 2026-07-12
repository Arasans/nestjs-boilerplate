import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPassDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  new_password: string;
}
