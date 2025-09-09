// validate.middleware.ts
import { RequestHandler } from "express";
import { ZodSchema } from "zod";

import { ApiError } from "../utils/ApiError";

type ZodErrorMessage = {
  expected: string,
  code: string,
  path: string[],
  message: string
} 

export const validate = (schema: ZodSchema): RequestHandler => {
  return (req, res, next): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = JSON.parse(result.error.message);
      const msg = errors.map((err: ZodErrorMessage) => ({
        field: err.path.join("."),   
        message: err.message
      }));

      return next(new ApiError("Validation error", 400, msg));
    }

    // validation passed
    req.body = result.data;
    next();
  };
};