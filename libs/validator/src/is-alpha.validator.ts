import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint()
export class IsAlphaConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (typeof value !== 'string') return false;
    return /^[a-zA-Z\s]+$/.test(value);
  }
  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must contain only letters and spaces`;
  }
}

export function IsAlpha(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsAlpha',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAlphaConstraint,
    });
  };
}
