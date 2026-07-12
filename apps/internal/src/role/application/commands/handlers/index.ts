import { CreateRoleHandler } from './create-role.handler';
import { UpdateRoleHandler } from './update-role.handler';
import { DeleteRoleHandler } from './delete-role.handler';
import { ToggleRoleHandler } from './toggle-role.handler';

export const RoleCommandsHandlers = [
  CreateRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
  ToggleRoleHandler,
];
