import { IsAlphaConstraint } from './is-alpha.validator';
import { IsAlphanumericConstraint } from './is-alphanumeric.validator';
import { IsExistConstraint } from './is-exists.validator';
import { IsUniqueConstraint } from './is-unique.validator';
import { MatchConstraint } from './match.validator';

export * from './is-alpha.validator';
export * from './is-alphanumeric.validator';
export * from './is-exists.validator';
export * from './is-unique.validator';
export * from './match.validator';

export const ValidatorProviders = [
  IsAlphaConstraint,
  IsAlphanumericConstraint,
  IsExistConstraint,
  IsUniqueConstraint,
  MatchConstraint,
];
