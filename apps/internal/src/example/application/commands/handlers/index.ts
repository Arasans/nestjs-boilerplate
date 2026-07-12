import { CreateExampleHandler } from './create-example.handler';
import { UpdateExampleHandler } from './update-example.handler';
import { DeleteExampleHandler } from './delete-example.handler';
import { ToggleExampleHandler } from './toggle-example.handler';

export const ExampleCommandsHandlers = [
  CreateExampleHandler,
  UpdateExampleHandler,
  DeleteExampleHandler,
  ToggleExampleHandler,
];
