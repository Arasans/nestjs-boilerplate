import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

export type IsUniqueOptions = {
  table: string;
  field?: string;
  getIgnoreValue?: (object: any) => any;
  ignoreField?: string;
};

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const {
      table,
      field = args.property,
      getIgnoreValue,
      ignoreField = '_id',
    }: IsUniqueOptions = args.constraints[0];

    if (!value) return false;

    const collection = this.connection.db!.collection(table);
    const query: any = { [field]: value };

    if (getIgnoreValue) {
      const ignoreValue = getIgnoreValue(args.object);
      if (ignoreValue !== undefined && ignoreValue !== null) {
        query[ignoreField] =
          ignoreField === '_id'
            ? { $ne: new Types.ObjectId(ignoreValue) }
            : { $ne: ignoreValue };
      }
    }

    const existing = await collection.findOne(query);
    return !existing;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be unique`;
  }
}

export function IsUnique(
  options: IsUniqueOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'IsUnique',
      target: object!.constructor,
      propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsUniqueConstraint,
    });
  };
}
