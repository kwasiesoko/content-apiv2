import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import Joi from 'joi';

export type CreatePaymentPayload = {
  planId?: string;
  billingCycle?: string;
};

@Injectable()
export class PaymentValidator {
  validateCreatePaymentDto(dto: CreatePaymentPayload): CreatePaymentPayload {
    const joiSchema = Joi.object<CreatePaymentPayload>({
      planId: Joi.string().trim().required(),
      billingCycle: Joi.string().valid('MONTHLY', 'ANNUAL').optional(),
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
