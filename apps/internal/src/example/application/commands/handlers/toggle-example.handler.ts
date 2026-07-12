import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ToggleExampleCommand } from '../impl';
import { ExampleService } from '../../../domain/example.service';

@CommandHandler(ToggleExampleCommand)
export class ToggleExampleHandler implements ICommandHandler<ToggleExampleCommand> {
  constructor(private readonly service: ExampleService) {}

  async execute({ id }: ToggleExampleCommand) {
    return this.service.toggleActive(id);
  }
}
