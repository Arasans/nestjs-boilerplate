import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateRoleCommand } from '../impl';
import { RoleService } from '../../../domain/role.service';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler implements ICommandHandler<UpdateRoleCommand> {
  constructor(private readonly service: RoleService) {}

  async execute({ id, dto }: UpdateRoleCommand) {
    return this.service.update(id, dto);
  }
}
