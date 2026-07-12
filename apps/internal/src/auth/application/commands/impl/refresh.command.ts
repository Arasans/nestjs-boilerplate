import { ICommand } from '@nestjs/cqrs';
import { ICurrentUserRt } from '../../../domain/auth.types';

export class RefreshCommand implements ICommand {
  constructor(public readonly user: ICurrentUserRt) {}
}
