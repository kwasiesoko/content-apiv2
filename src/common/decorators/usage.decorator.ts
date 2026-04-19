import { SetMetadata } from '@nestjs/common';
import { FeatureType } from '@prisma/client';

export const CHECK_USAGE_KEY = 'check_usage';
export const CheckUsage = (feature: FeatureType) => SetMetadata(CHECK_USAGE_KEY, feature);
