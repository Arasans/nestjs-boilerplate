import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../impl';
import { UserService } from '../../../domain/user.service';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute({ id }: DeleteUserCommand) {
    await this.service.delete(id);
    return null;
  }
}
