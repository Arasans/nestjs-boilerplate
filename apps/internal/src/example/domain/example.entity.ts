export class Example {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateExampleData = Pick<Example, 'name'> &
  Partial<Pick<Example, 'description'>>;
export type UpdateExampleData = Partial<Pick<Example, 'name' | 'description'>>;
