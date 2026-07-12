import { CreateUserHandler } from './create-user.handler';
import { UpdateUserHandler } from './update-user.handler';
import { DeleteUserHandler } from './delete-user.handler';
import { ToggleUserHandler } from './toggle-user.handler';

export const UserCommandsHandlers = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  ToggleUserHandler,
];
