import { ValidationError } from '@nestjs/common';

export function validateErrorFormat(errors: ValidationError[]) {
  return errors.reduce(
    (p, c: ValidationError) => {
      if (!c.children || !c.children.length) {
        p[c.property] = Object.values(c.constraints ?? {});
      } else {
        p[c.property] = validateErrorFormat(c.children);
      }
      return p;
    },
    {} as Record<string, any>,
  );
}
