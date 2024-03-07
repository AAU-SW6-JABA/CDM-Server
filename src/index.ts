import { AppDataSource } from "./data-source.ts"
import { Prisma, PrismaClient } from '@prisma/client'
import { setupDB } from "./setup_db.ts";
import { Query } from "typeorm/driver/Query.js";
import { measureMemory } from "vm";

export class LocationDatabase {
    private Prisma: PrismaClient;

    constructor() {
        this.Prisma = new PrismaClient;
    }

    async GetLocations(startTime?: number, endTime?: number): Promise<{
        imsi: bigint;
        x: number | null;
        y: number | null;
        calctime: bigint;
    }[]> {
        let query: Prisma.locationFindManyArgs = {};

        if (startTime && endTime) {
            query.where = {
                calctime: {
                    gte: BigInt(startTime),
                    lte: BigInt(endTime),
                },
            };
        }

        const locations = await this.Prisma.location.findMany(query);
        return locations;
    }
    async GetMeasurements(startTime?: number, endTime?: number): Promise<{
        mid: number,
        imsi: number,
        aid: number,
        timestamp: number,
        strengthDBM: number
    }[]> {
        let query: Prisma.measurementFindFirstArgs = {};
        if (startTime && endTime) {
            query.where = {
                timestamp: {
                    gte: BigInt(startTime),
                    lte: BigInt(endTime),
                },
            };
        }

        const Measurement = await this.Prisma.measurement.findMany(query);
        return Measurement
    }

