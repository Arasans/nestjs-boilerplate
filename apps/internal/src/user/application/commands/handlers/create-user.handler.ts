import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../impl';
import { UserService } from '../../../domain/user.service';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly service: UserService) {}

  async execute({ dto }: CreateUserCommand) {
    return this.service.create(dto);
  }
}
