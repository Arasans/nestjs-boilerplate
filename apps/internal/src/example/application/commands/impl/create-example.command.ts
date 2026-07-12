import { ICommand } from '@nestjs/cqrs';
import { CreateExampleDto } from '../../dto/create-example.dto';

export class CreateExampleCommand implements ICommand {
  constructor(public readonly dto: CreateExampleDto) {}
}
