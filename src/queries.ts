import { Prisma, PrismaClient } from "@prisma/client";
import type {
    antennas,
    location,
    calculation,
    measurement,
} from "@prisma/client";

export class LocationDatabase {
    public Prisma: PrismaClient;

    constructor() {
        this.Prisma = new PrismaClient();
    }

    async getLocationsUsingTime(
        startTime: number,
        endTime: number
    ): Promise<location[]> {
        let query: Prisma.locationFindManyArgs = {};

        if (startTime && endTime) {
            query.where = {
                calctime: {
                    gte: startTime, //Greater than or equal to
                    lte: endTime, //Less than or equal to
                },
            };
        }

        return await this.Prisma.location.findMany(query);
    }
    async getAllLocations(): Promise<location[]> {
        return await this.Prisma.location.findMany();
    }

    async getAllMeasurements(): Promise<measurement[]> {
        return await this.Prisma.measurement.findMany();
    }

    async getMeasurementsBetweenTimestamps(
        startTime: number,
        endTime: number
    ): Promise<measurement[]> {
        let query: Prisma.measurementFindFirstArgs = {};

        if (startTime && endTime) {
            query.where = {
                timestamp: {
                    gte: startTime, //Greater than or equal to
                    lte: endTime, //Less than or equal to
                },
            };
        }
        return await this.Prisma.measurement.findMany(query);
    }

    async getCalculation(): Promise<calculation[]> {
        return await this.Prisma.calculation.findMany();
    }

    async getAntennasUsingAid(
        aid: number
    ): Promise<antennas[]> {
        let query: Prisma.antennasFindManyArgs = {};

        if (aid) {
            query.where = {
                aid: aid,
            };
        }

        return await this.Prisma.antennas.findMany(query);
    }
    async getAllAntennas(): Promise<antennas[]> {
        return await this.Prisma.antennas.findMany();
    }

    async insertLocations(
        imsi: string,
        calctime: number,
        x: number,
        y: number
    ) {
        await this.Prisma.location.create({
            data: {
                imsi: imsi,
                calctime: calctime,
                x: x,
                y: y,
            },
        });
    }
    async insertMeasurement(
        imsi: string,
        aid: number,
        timestamp: number,
        strengthDBM: number
    ) {
        await this.Prisma.measurement.create({
            data: {
                imsi: imsi,
                aid: aid,
                timestamp: timestamp,
                strengthDBM: strengthDBM,
            },
        });
    }

    async insertCalculations(imsi: string, calctime: number, mid: number) {
        await this.Prisma.calculation.create({
            data: {
                imsi: imsi,
                calctime: calctime,
                mid: mid,
            },
        });
    }

    async insertAntenna(x: number, y: number): Promise<antennas> {
        const antenna = await this.Prisma.antennas.create({
            data: {
                x: x,
                y: y,
            },
        });
        return antenna;
    }
}
