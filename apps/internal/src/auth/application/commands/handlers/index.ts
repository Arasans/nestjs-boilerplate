import { LoginHandler } from './login.handler';
import { RefreshHandler } from './refresh.handler';
import { ResetPassHandler } from './reset-pass.handler';

export const AuthCommandsHandlers = [
  LoginHandler,
  RefreshHandler,
  ResetPassHandler,
];
