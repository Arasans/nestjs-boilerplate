import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ToggleUserCommand } from '../impl';
import { UserService } from '../../../domain/user.service';

@CommandHandler(ToggleUserCommand)
export class ToggleUserHandler implements ICommandHandler<ToggleUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute({ id }: ToggleUserCommand) {
    return this.service.toggleActive(id);
  }
}
