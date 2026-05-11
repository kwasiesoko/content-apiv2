import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import Joi from 'joi';

export type CommodityListQuery = {
  page?: number | string;
  limit?: number | string;
  name?: string;
  price?: number | string;
  measure?: string;
  type?: string;
  marketId?: string;
  marketIds?: string | string[];
  markets?: string | string[];
  marketDistrict?: string;
  marketRegion?: string;
  marketCountry?: string;
  startDate?: string;
  endDate?: string;
};

@Injectable()
export class CommodityValidator {
  validateCommodityListQuery(dto: CommodityListQuery): CommodityListQuery {
    const joiSchema = Joi.object<CommodityListQuery>({
      page: Joi.number().integer().positive().default(1),
      limit: Joi.number().integer().positive().default(20),
      name: Joi.string().trim().optional(),
      price: Joi.number().optional(),
      measure: Joi.string().trim().optional(),
      type: Joi.string().trim().optional(),
      marketId: Joi.string().trim().optional(),
      marketIds: Joi.alternatives().try(
        Joi.array().items(Joi.string().trim()),
        Joi.string().trim()
      ).optional(),
      markets: Joi.alternatives().try(
        Joi.array().items(Joi.string().trim()),
        Joi.string().trim()
      ).optional(),
      marketDistrict: Joi.string().trim().optional(),
      marketRegion: Joi.string().trim().optional(),
      marketCountry: Joi.string().trim().optional(),
      startDate: Joi.string().trim().optional(),
      endDate: Joi.string().trim().optional(),
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

  validateCommodityId(id: string): string {
    const joiSchema = Joi.string().trim().uuid().required();
    const { error, value } = joiSchema.validate(id);

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
