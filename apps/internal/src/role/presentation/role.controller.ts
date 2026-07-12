import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtGuard } from '../../auth/infrastructure/guards/jwt.guard';
import { PermissionsGuard } from '../../auth/infrastructure/guards/permissions.guard';
import { Permissions } from '../../auth/infrastructure/decorators/permissions.decorator';
import { PERMISSION } from '../domain/permission.enum';
import { CreateRoleDto } from '../application/dto/create-role.dto';
import { UpdateRoleDto } from '../application/dto/update-role.dto';
import { ListRoleDto } from '../application/dto/list-role.dto';
import {
  CreateRoleCommand,
  UpdateRoleCommand,
  DeleteRoleCommand,
  ToggleRoleCommand,
} from '../application/commands';
import { GetRoleQuery, ListRolesQuery } from '../application/queries';

@Controller('roles')
@UseGuards(JwtGuard, PermissionsGuard)
@Permissions(PERMISSION['ROLE:MANAGE'])
@ApiTags('Roles')
@ApiBearerAuth()
export class RoleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Permissions(PERMISSION['ROLE:READ'])
  list(@Query() args: ListRoleDto) {
    return this.queryBus.execute(new ListRolesQuery(args));
  }

  @Get(':id')
  @Permissions(PERMISSION['ROLE:READ'])
  getOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetRoleQuery(id));
  }

  @Post()
  @Permissions(PERMISSION['ROLE:CREATE'])
  create(@Body() dto: CreateRoleDto) {
    return this.commandBus.execute(new CreateRoleCommand(dto));
  }

  @Patch(':id/toggle')
  @Permissions(PERMISSION['ROLE:UPDATE'])
  toggle(@Param('id') id: string) {
    return this.commandBus.execute(new ToggleRoleCommand(id));
  }

  @Patch(':id')
  @Permissions(PERMISSION['ROLE:UPDATE'])
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.commandBus.execute(new UpdateRoleCommand(id, dto));
  }

  @Delete(':id')
  @Permissions(PERMISSION['ROLE:DELETE'])
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteRoleCommand(id));
  }
}
