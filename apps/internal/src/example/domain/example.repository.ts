import {
  Example,
  CreateExampleData,
  UpdateExampleData,
} from './example.entity';
import { CursorMeta } from '@app/common';

export interface ExampleFilter {
  search?: string;
  isActive?: boolean;
  sort?: string;
  sortOrder?: 1 | -1;
  cursor?: string;
  take?: number;
  direction?: 'next' | 'prev';
}

export abstract class IExampleRepository {
  abstract findById(id: string): Promise<Example | null>;
  abstract findAll(
    filter: ExampleFilter,
  ): Promise<{ data: Example[]; meta: CursorMeta }>;
  abstract create(data: CreateExampleData): Promise<Example>;
  abstract update(
    id: string,
    data: UpdateExampleData,
  ): Promise<Example | null>;
  abstract delete(id: string): Promise<boolean>;
  abstract toggleActive(id: string): Promise<Example | null>;
}
