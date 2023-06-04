import { HttpException, HttpStatus } from '@nestjs/common';

export const formatErrors = (errors: any[]) => {
  const statusCode = HttpStatus.BAD_REQUEST;
  errors = errors.map((error) => {
    for (const property in error.constraints) {
      return {
        field: error.property,
        message: error.constraints[property],
      };
    }
  });

  return new HttpException({ statusCode, errors }, HttpStatus.BAD_REQUEST);
};
