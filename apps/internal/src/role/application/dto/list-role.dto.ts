import { BaseFilterCursorDto } from '@app/common';
import { PartialType } from '@nestjs/swagger';

export class ListRoleDto extends PartialType(BaseFilterCursorDto) {}
