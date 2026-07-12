import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint()
export class IsAlphanumericConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^[a-zA-Z0-9]+$/.test(value);
  }
  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must contain only letters and numbers`;
  }
}

export function IsAlphanumeric(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsAlphanumeric',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphanumericConstraint,
    });
  };
}
