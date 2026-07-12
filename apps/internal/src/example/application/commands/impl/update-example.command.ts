import { ICommand } from '@nestjs/cqrs';
import { UpdateExampleDto } from '../../dto/update-example.dto';

export class UpdateExampleCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateExampleDto,
  ) {}
}
