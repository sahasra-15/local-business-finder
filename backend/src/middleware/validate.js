import { errorResponse } from '../utils/response.js';

export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsed = await schema.parseAsync(dataToValidate);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorDetails = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return errorResponse(res, 'Validation failed', 400, errorDetails);
      }
      return errorResponse(res, err.message || 'Validation failed', 400);
    }
  };
};
