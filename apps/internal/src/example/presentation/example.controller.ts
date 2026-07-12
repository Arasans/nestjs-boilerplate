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
import { CreateExampleDto } from '../application/dto/create-example.dto';
import { UpdateExampleDto } from '../application/dto/update-example.dto';
import { ListExampleDto } from '../application/dto/list-example.dto';
import {
  CreateExampleCommand,
  UpdateExampleCommand,
  DeleteExampleCommand,
  ToggleExampleCommand,
} from '../application/commands';
import { GetExampleQuery, ListExamplesQuery } from '../application/queries';

@Controller('examples')
@UseGuards(JwtGuard, PermissionsGuard)
@Permissions(PERMISSION['EXAMPLE:MANAGE'])
@ApiTags('Examples')
@ApiBearerAuth()
export class ExampleController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @Permissions(PERMISSION['EXAMPLE:READ'])
  list(@Query() args: ListExampleDto) {
    return this.queryBus.execute(new ListExamplesQuery(args));
  }

  @Get(':id')
  @Permissions(PERMISSION['EXAMPLE:READ'])
  getOne(@Param('id') id: string) {
    return this.queryBus.execute(new GetExampleQuery(id));
  }

  @Post()
  @Permissions(PERMISSION['EXAMPLE:CREATE'])
  create(@Body() dto: CreateExampleDto) {
    return this.commandBus.execute(new CreateExampleCommand(dto));
  }

  @Patch(':id/toggle')
  @Permissions(PERMISSION['EXAMPLE:UPDATE'])
  toggle(@Param('id') id: string) {
    return this.commandBus.execute(new ToggleExampleCommand(id));
  }

  @Patch(':id')
  @Permissions(PERMISSION['EXAMPLE:UPDATE'])
  update(@Param('id') id: string, @Body() dto: UpdateExampleDto) {
    return this.commandBus.execute(new UpdateExampleCommand(id, dto));
  }

  @Delete(':id')
  @Permissions(PERMISSION['EXAMPLE:DELETE'])
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteExampleCommand(id));
  }
}
