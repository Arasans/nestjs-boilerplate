import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefreshCommand } from '../impl';
import { AuthService } from '../../../domain/auth.service';

@CommandHandler(RefreshCommand)
export class RefreshHandler implements ICommandHandler<RefreshCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: RefreshCommand) {
    return this.authService.refresh(command.user.id);
  }
}
