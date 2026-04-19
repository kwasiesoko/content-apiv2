import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import prisma from '../../common/prisma';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    async seedCommodities() {
        this.logger.log('Starting seed process for Markets and Commodities...');
        const csvFilePath = path.resolve(process.cwd(), 'commodities.csv');

        if (!fs.existsSync(csvFilePath)) {
            this.logger.error(`CSV file not found at ${csvFilePath}`);
            return;
        }

        const records: any[] = [];
        const parser = fs
            .createReadStream(csvFilePath)
            .pipe(parse({
                columns: true,
                skip_empty_lines: true,
                trim: true,
            }));

        for await (const record of parser) {
            records.push(record);
        }

        this.logger.log(`Parsed ${records.length} records. Processing markets...`);

        // Group rows by Market name to avoid redundant database calls
        const marketNames = Array.from(new Set(records.map(r => r.Market).filter(m => !!m)));
        const marketsMap = new Map<string, string>(); // marketName -> marketId

        for (const name of marketNames) {
            const firstOccurrence = records.find(r => r.Market === name);
            const market = await prisma.market.upsert({
                where: { name: name },
                update: {
                    district: firstOccurrence.Town || null,
                    region: firstOccurrence.Region || null,
                    country: firstOccurrence.Country || 'Ghana',
                },
                create: {
                    name: name,
                    district: firstOccurrence.Town || null,
                    region: firstOccurrence.Region || null,
                    country: firstOccurrence.Country || 'Ghana',
                }
            });
            marketsMap.set(name, market.id);
        }

        this.logger.log(`Ensured ${marketsMap.size} markets exist. Processing commodities...`);

        // Prepare commodity data for insertion
        const commodityData = records.map(r => {
            const price = parseFloat(r['Average Price']);
            return {
                name: r.Commodity,
                price: isNaN(price) ? 0 : price,
                measure: r.Measurement || 'kilo',
                currency: 'GHS', // Defaulting to GHS based on context
                type: r['Price Type'] || 'Retail',
                marketId: marketsMap.get(r.Market) as string,
                collectedDate: r['Date Collected'] ? new Date(r['Date Collected']) : new Date(),
            };
        }).filter(c => !!c.marketId);

        // Clear existing commodities to avoid duplicates if re-seeding (optional, based on preference)
        // Here we just append, but we use a small batch size to avoid memory issues if large
        const batchSize = 1000;
        for (let i = 0; i < commodityData.length; i += batchSize) {
            const batch = commodityData.slice(i, i + batchSize);
            await prisma.commodity.createMany({
                data: batch,
                skipDuplicates: true, // Requires unique constraint if we want real skip, but here it helps with errors
            });
            this.logger.log(`Inserted batch ${Math.floor(i / batchSize) + 1} of commodities...`);
        }

        this.logger.log('Seed process completed successfully.');
    }
}
