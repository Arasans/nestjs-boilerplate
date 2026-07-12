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
import { PERMISSION } from '../../role/domain/permission.enum';
import { CreateUserDto } from '../application/dto/create-user.dto';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { ListUserDto } from '../application/dto/list-user.dto';
import {
  CreateUserCommand,
  UpdateUserCommand,
  DeleteUserCommand,
  ToggleUserCommand,
} from '../application/commands';
import { GetUserQuery, ListUsersQuery } from '../application/queries';

@Controller('users')
@UseGuards(JwtGuard, PermissionsGuard)
@Permissions(PERMISSION['USER:MANAGE'])
@ApiTags('Users')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Permissions(PERMISSION['USER:READ'])
  list(@Query() args: ListUserDto) {
    return this.queryBus.execute(new ListUsersQuery(args));
  }

  @Get(':id')
  @Permissions(PERMISSION['USER:READ'])
  getOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Post()
  @Permissions(PERMISSION['USER:CREATE'])
  create(@Body() dto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Patch(':id/toggle')
  @Permissions(PERMISSION['USER:UPDATE'])
  toggle(@Param('id') id: string) {
    return this.commandBus.execute(new ToggleUserCommand(id));
  }

  @Patch(':id')
  @Permissions(PERMISSION['USER:UPDATE'])
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto));
  }

  @Delete(':id')
  @Permissions(PERMISSION['USER:DELETE'])
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteUserCommand(id));
  }
}
