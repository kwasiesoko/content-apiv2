import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import Joi from 'joi';

export type MarketListQuery = {
  page?: number | string;
  limit?: number | string;
  search?: string;
  name?: string;
  district?: string;
  region?: string;
  country?: string;
};

@Injectable()
export class MarketValidator {
  validateMarketListQuery(dto: MarketListQuery): MarketListQuery {
    const joiSchema = Joi.object<MarketListQuery>({
      page: Joi.number().integer().positive().default(1),
      limit: Joi.number().integer().positive().default(20),
      search: Joi.string().trim().optional(),
      name: Joi.string().trim().optional(),
      district: Joi.string().trim().optional(),
      region: Joi.string().trim().optional(),
      country: Joi.string().trim().optional(),
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
