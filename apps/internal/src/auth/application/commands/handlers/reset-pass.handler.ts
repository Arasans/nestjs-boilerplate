import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResetPassCommand } from '../impl';
import { AuthService } from '../../../domain/auth.service';

@CommandHandler(ResetPassCommand)
export class ResetPassHandler implements ICommandHandler<ResetPassCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: ResetPassCommand) {
    return this.authService.resetPassword(
      command.user.id,
      command.request.new_password,
    );
  }
}
