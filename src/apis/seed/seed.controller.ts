import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Post('commodities')
    async seed() {
        this.seedService.seedCommodities().catch(err => {
            console.error('Background seeding failed:', err);
        });
        return { message: 'Seeding commodity data in the background' };
    }
}
