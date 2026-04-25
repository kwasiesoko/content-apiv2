import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import Joi from 'joi';

export type CreateTopupPayload = {
  amount?: number | string;
};

@Injectable()
export class TopupValidator {
  validateCreateTopupDto(dto: CreateTopupPayload): CreateTopupPayload {
    const joiSchema = Joi.object<CreateTopupPayload>({
      amount: Joi.number().positive().required(),
    }).options({
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    const { error, value } = joiSchema.validate(dto);
    if (error) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        errors: error.details.map((detail) => detail.message),
      });
    }

    return value;
  }
}
