import { ICommand } from '@nestjs/cqrs';
import { LoginDto } from '../../dto/login.dto';

export class LoginCommand implements ICommand {
  constructor(public readonly request: LoginDto) {}
}
