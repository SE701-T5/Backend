import Joi from 'joi';
import { ServerError } from './utils.lib';

const username = () => Joi.string().min(3).alphanum();
const password = () => Joi.string().min(6);
const objectId = () => Joi.string().hex().length(24);
const voteDelta = () => Joi.number().valid([-1, 1]);

export const validators = {
  username,
  password,
  objectId,
  voteDelta,
};

export function validate<T>(
  rules: Joi.AnySchema<T>,
  data: unknown,
  options?: Joi.ValidationOptions,
): T {
  const result = rules.validate(data, options);

  if (result.error) {
    throw new ServerError(result.error.message, 400, result);
  } else {
    return result.value;
  }
}
