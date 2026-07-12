import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateExampleCommand } from '../impl';
import { ExampleService } from '../../../domain/example.service';

@CommandHandler(CreateExampleCommand)
export class CreateExampleHandler implements ICommandHandler<CreateExampleCommand> {
  constructor(private readonly service: ExampleService) {}

  async execute({ dto }: CreateExampleCommand) {
    return this.service.create(dto);
  }
}
