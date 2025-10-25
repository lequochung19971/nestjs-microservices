// form-data-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class FormDataValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // 1. Transform the plain object (value) into an instance of the DTO class (metatype)
    // This is where class-transformer's @Type decorators are applied (e.g., '100' -> 100)
    const object = plainToInstance(metatype, value);

    // 2. Validate the transformed object
    const errors = await validate(object);

    if (errors.length > 0) {
      // Throw a bad request exception if validation fails
      throw new BadRequestException(errors);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
