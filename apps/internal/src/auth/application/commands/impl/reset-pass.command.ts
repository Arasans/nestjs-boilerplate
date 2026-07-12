import { ICommand } from '@nestjs/cqrs';
import { ICurrentUser } from '../../../domain/auth.types';
import { ResetPassDto } from '../../dto/reset-pass.dto';

export class ResetPassCommand implements ICommand {
  constructor(
    public readonly user: ICurrentUser,
    public readonly request: ResetPassDto,
  ) {}
}
