import { AppDataSource } from "./data-source.ts";
import { Prisma, PrismaClient } from "@prisma/client";
import { Query } from "typeorm/driver/Query.js";

export class LocationDatabase {
    private Prisma: PrismaClient;

    constructor() {
        this.Prisma = new PrismaClient();
    }

    async GetLocations(
        startTime?: number,
        endTime?: number
    ): Promise<
        {
            imsi: bigint;
            x: number | null;
            y: number | null;
            calctime: bigint;
        }[]
    > {
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

    async GetMeasurements(
        startTime?: number,
        endTime?: number
    ): Promise<
        {
            mid: number;
            imsi: bigint;
            aid: number;
            timestamp: bigint;
            strengthDBM: number;
        }[]
    > {
        let query: Prisma.measurementFindFirstArgs = {};

        //if there is no startTime and endTime then it returns all the measurements
        if (startTime && endTime) {
            query.where = {
                timestamp: {
                    gte: BigInt(startTime),
                    lte: BigInt(endTime),
                },
            };
        }

        const Measurement = await this.Prisma.measurement.findMany(query);
        return Measurement;
    }

    async InsertCalculations(imsi: number, calctime: number, mid: number) {
        const insertetData = await this.Prisma.calculation.create({
            data: {
                imsi: imsi,
                calctime: calctime,
                mid: mid,
            },
        });
    }

    async InsertLocations(
        imsi: number,
        calctime: number,
        x: number,
        y: number
    ) {
        const InsertData = await this.Prisma.location.create({
            data: {
                imsi: imsi,
                calctime: calctime,
                x: x,
                y: y,
            },
        });
    }

    async InsertAntenna(x: number, y: number) {
        const insertData = await this.Prisma.antennas.create({
            data: {
                x: x,
                y: y,
            },
        });
    }
}
