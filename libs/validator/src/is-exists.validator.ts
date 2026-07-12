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

export type IsExistOptions = {
  table: string;
  field?: string;
  isObjectId?: boolean;
};

@ValidatorConstraint({ async: true })
@Injectable()
export class IsExistConstraint implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const {
      table,
      field = '_id',
      isObjectId,
    }: IsExistOptions = args.constraints[0];

    if (!value) return false;

    const collection = this.connection.db!.collection(table);

    if (Array.isArray(value)) {
      if (value.length === 0) return false;
      if (field === '_id' || isObjectId) {
        for (const v of value) {
          if (!Types.ObjectId.isValid(v)) return false;
        }
      }
      const queryValues =
        field === '_id' || isObjectId
          ? value.map((v) => new Types.ObjectId(v))
          : value;
      const count = await collection.countDocuments({
        [field]: { $in: queryValues },
      });
      return count === value.length;
    }

    if ((field === '_id' || isObjectId) && !Types.ObjectId.isValid(value)) {
      return false;
    }

    const queryValue =
      field === '_id' || isObjectId ? new Types.ObjectId(value) : value;
    const found = await collection.findOne({ [field]: queryValue });
    return !!found;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} contains non-existing value`;
  }
}

export function IsExist(
  options: IsExistOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      name: 'IsExist',
      target: object!.constructor,
      propertyName,
      constraints: [options],
      options: validationOptions,
      validator: IsExistConstraint,
    });
  };
}
