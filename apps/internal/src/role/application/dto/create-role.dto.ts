import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { PERMISSION } from '../../domain/permission.enum';

export class CreateRoleDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: PERMISSION, isArray: true })
  @IsArray()
  permissions: PERMISSION[];
}
