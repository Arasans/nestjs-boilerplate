import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ToggleRoleCommand } from '../impl';
import { RoleService } from '../../../domain/role.service';

@CommandHandler(ToggleRoleCommand)
export class ToggleRoleHandler implements ICommandHandler<ToggleRoleCommand> {
  constructor(private readonly service: RoleService) {}

  async execute({ id }: ToggleRoleCommand) {
    return this.service.togglePrimary(id);
  }
}
