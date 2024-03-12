import { Prisma, PrismaClient } from "@prisma/client";


export class LocationDatabase {
    private Prisma: PrismaClient;

    constructor() {
        this.Prisma = new PrismaClient();
    }

    async GetLocationsUsingTime(
        startTime: number,
        endTime: number
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
    async GetAllLocations(): Promise<
        {
            imsi: bigint;
            x: number | null;
            y: number | null;
            calctime: bigint;
        }[]
    > {
        const locations = await this.Prisma.location.findMany();
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

    async getCalculation(): Promise<
        {
            imsi: BigInt;
            calctime: BigInt;
            mid: Number;
        }[]
    > {
        const insertData = await this.Prisma.calculation.findMany();
        return insertData;
    }

    async GetAntennasUsingAid(
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
    async GetAllAntennas():Promise<{aid: number,x:number,y:number}[]>
    {
        return await this.Prisma.antennas.findMany();
    }


    async InsertLocations(
        imsi: bigint,
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
    async InsertMeasurent(
        imsi: bigint,
        aid: number,
        timestamp: bigint,
        strengthDBM: number
    ) {
        const insertData = await this.Prisma.measurement.create({
            data: {
                imsi: imsi,
                aid: aid,
                timestamp: timestamp,
                strengthDBM: strengthDBM,
            },
        });
    }

    async InsertCalculations(imsi: bigint, calctime: number, mid: number) {
        const insertetData = await this.Prisma.calculation.create({
            data: {
                imsi: imsi,
                calctime: calctime,
                mid: mid,
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