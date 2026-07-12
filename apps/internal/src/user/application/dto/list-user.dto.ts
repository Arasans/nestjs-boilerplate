import { BaseFilterCursorDto } from '@app/common';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class ListUserDto extends PartialType(BaseFilterCursorDto) {
  @ApiPropertyOptional()
  @IsOptional()
  is_active?: boolean;
}
