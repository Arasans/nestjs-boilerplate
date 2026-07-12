import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { PERMISSION } from '../../domain/permission.enum';

export type RoleDocument = HydratedDocument<Role> & {
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true, strict: true })
export class Role {
  @Prop({ required: true, unique: true, maxlength: 50 })
  name: string;

  @Prop({
    type: [String],
    enum: Object.values(PERMISSION).filter((v) => typeof v === 'string'),
    required: true,
  })
  permissions: PERMISSION[];

  @Prop({ default: false })
  isPrimary?: boolean;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
