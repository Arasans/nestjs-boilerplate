import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateExampleCommand } from '../impl';
import { ExampleService } from '../../../domain/example.service';

@CommandHandler(UpdateExampleCommand)
export class UpdateExampleHandler implements ICommandHandler<UpdateExampleCommand> {
  constructor(private readonly service: ExampleService) {}

  async execute({ id, dto }: UpdateExampleCommand) {
    return this.service.update(id, dto);
  }
}
