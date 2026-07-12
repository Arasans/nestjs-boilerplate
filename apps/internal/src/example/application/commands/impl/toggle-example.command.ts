import { ICommand } from '@nestjs/cqrs';

export class ToggleExampleCommand implements ICommand {
  constructor(public readonly id: string) {}
}
