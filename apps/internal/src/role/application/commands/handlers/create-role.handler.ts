import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateRoleCommand } from '../impl';
import { RoleService } from '../../../domain/role.service';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler implements ICommandHandler<CreateRoleCommand> {
  constructor(private readonly service: RoleService) {}

  async execute({ dto }: CreateRoleCommand) {
    return this.service.create(dto);
  }
}
