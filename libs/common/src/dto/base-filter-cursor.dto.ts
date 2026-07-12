import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum CursorDirection {
  NEXT = 'next',
  PREV = 'prev',
}

export class BaseFilterCursorDto {
  @ApiPropertyOptional({ description: 'Search keyword', example: 'apple' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Cursor for pagination' })
  @IsOptional()
  @IsString()
  @IsMongoId()
  cursor?: string;

  @ApiPropertyOptional({
    description: 'Number of items to take',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  take?: number;

  @ApiPropertyOptional({
    description: 'Sort field name',
    example: 'created_at',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort type',
    enum: SortType,
    example: SortType.DESC,
  })
  @IsOptional()
  @IsEnum(SortType)
  sort_type?: SortType;

  @ApiPropertyOptional({
    description: 'Pagination direction',
    enum: CursorDirection,
    default: CursorDirection.NEXT,
  })
  @IsOptional()
  @IsEnum(CursorDirection)
  direction?: CursorDirection;
}
