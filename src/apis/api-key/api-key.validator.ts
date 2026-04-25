import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import Joi from 'joi';

export type CreateApiKeyPayload = {
  name?: string;
};

@Injectable()
export class ApiKeyValidator {
  validateCreateApiKeyDto(dto: CreateApiKeyPayload): CreateApiKeyPayload {
    const joiSchema = Joi.object<CreateApiKeyPayload>({
      name: Joi.string().trim().min(1).max(100).optional(),
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
