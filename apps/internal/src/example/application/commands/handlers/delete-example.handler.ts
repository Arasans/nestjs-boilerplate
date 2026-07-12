import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteExampleCommand } from '../impl';
import { ExampleService } from '../../../domain/example.service';

@CommandHandler(DeleteExampleCommand)
export class DeleteExampleHandler implements ICommandHandler<DeleteExampleCommand> {
  constructor(private readonly service: ExampleService) {}

  async execute({ id }: DeleteExampleCommand) {
    await this.service.delete(id);
    return null;
  }
}
