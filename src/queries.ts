import { Prisma, PrismaClient } from "@prisma/client";


export class LocationDatabase {
    private Prisma: PrismaClient;

    constructor() {
        this.Prisma = new PrismaClient();
    }

    async getLocationsUsingTime(
        startTime: number,
        endTime: number
    ): Promise<
        {
            imsi: bigint;
            x: number;
            y: number;
            calctime: bigint;
        }[]
    > {
        let query: Prisma.locationFindManyArgs = {};

        if (startTime && endTime) {
            query.where = {
                calctime: {
                    gte: startTime, //Greater than or equal to
                    lte: endTime, //Less than or equal to
                },
            };
        }
         
        return await this.Prisma.location.findMany(query);;
    }
    async getAllLocations(): Promise<
        {
            imsi: bigint;
            x: number;
            y: number;
            calctime: bigint;
        }[]
    > {
        return await this.Prisma.location.findMany();
    }

    async getAllMeasurements(
    ): Promise<
        {
            mid: number;
            imsi: bigint;
            aid: number;
            timestamp: bigint;
            strengthDBM: number;
        }[]
    > {
        return await this.Prisma.measurement.findMany();
    }

    async getMeasurementsBetweenTimestamps(
        startTime: number,
        endTime: number
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

    async getCalculation(): Promise<
        {
            imsi: bigint;
            calctime: bigint;
            mid: number;
        }[]
    > {
        return await this.Prisma.calculation.findMany();
    }

    async getAntennasUsingAid(
        aid: number
    ): Promise<{ aid: number; x: number; y: number }[]> {
        let query: Prisma.antennasFindManyArgs = {};

        if (aid) {
            query.where = {
                aid: aid,
            };
        }

        return await this.Prisma.antennas.findMany(query);
    }
    async getAllAntennas():Promise<{aid: number,x:number,y:number}[]>
    {
        return await this.Prisma.antennas.findMany();
    }


    async insertLocations(
        imsi: bigint,
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
    async insertMeasurent(
        imsi: bigint,
        aid: number,
        timestamp: bigint,
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

    async insertCalculations(imsi: bigint, calctime: number, mid: number) {
        await this.Prisma.calculation.create({
            data: {
                imsi: imsi,
                calctime: calctime,
                mid: mid,
            },
        });
    }

    async insertAntenna(x: number, y: number) {
        await this.Prisma.antennas.create({
            data: {
                x: x,
                y: y,
            },
        });
    }
}
