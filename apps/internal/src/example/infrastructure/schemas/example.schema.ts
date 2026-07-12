import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExampleDocument = HydratedDocument<Example> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Example {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: true })
  isActive?: boolean;
}

export const ExampleSchema = SchemaFactory.createForClass(Example);
ExampleSchema.index({ name: 1 });
