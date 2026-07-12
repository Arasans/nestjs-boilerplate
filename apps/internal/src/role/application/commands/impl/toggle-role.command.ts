import { ICommand } from '@nestjs/cqrs';

export class ToggleRoleCommand implements ICommand {
  constructor(public readonly id: string) {}
}
