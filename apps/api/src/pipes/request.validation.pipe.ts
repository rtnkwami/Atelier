import { BadRequestException, PipeTransform } from '@nestjs/common';
import z, { ZodType } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: any) {
    const result = this.schema.safeParse(value);

    if (result.error) {
      const { fieldErrors, formErrors } = z.flattenError(result.error);

      throw new BadRequestException({
        message: 'request body is invalid',
        invalidFields: fieldErrors,
        unknownFields: formErrors,
      });
    }
    return result.data;
  }
}
