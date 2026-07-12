import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteRoleCommand } from '../impl';
import { RoleService } from '../../../domain/role.service';

@CommandHandler(DeleteRoleCommand)
export class DeleteRoleHandler implements ICommandHandler<DeleteRoleCommand> {
  constructor(private readonly service: RoleService) {}

  async execute({ id }: DeleteRoleCommand) {
    await this.service.delete(id);
    return null;
  }
}
