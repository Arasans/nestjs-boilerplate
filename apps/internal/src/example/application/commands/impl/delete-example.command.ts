import { ICommand } from '@nestjs/cqrs';

export class DeleteExampleCommand implements ICommand {
  constructor(public readonly id: string) {}
}
