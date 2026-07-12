import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Example,
  ExampleSchema,
} from './infrastructure/schemas/example.schema';
import { MongoExampleRepository } from './infrastructure/repositories/example.repository';
import { IExampleRepository } from './domain/example.repository';
import { ExampleService } from './domain/example.service';
import { ExampleCommandsHandlers } from './application/commands';
import { ExampleQueriesHandlers } from './application/queries';
import { ExampleController } from './presentation/example.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Example.name, schema: ExampleSchema }]),
  ],
  controllers: [ExampleController],
  providers: [
    { provide: IExampleRepository, useClass: MongoExampleRepository },
    ExampleService,
    ...ExampleCommandsHandlers,
    ...ExampleQueriesHandlers,
  ],
})
export class ExampleModule {}
