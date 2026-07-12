import { ICommand } from '@nestjs/cqrs';

export class ToggleUserCommand implements ICommand {
  constructor(public readonly id: string) {}
}
