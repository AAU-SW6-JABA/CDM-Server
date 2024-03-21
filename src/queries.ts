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

    async getLocation(method: number,
        identifier?: string,
        timeinterval?: number,
        n_recent?: number):
        Promise<location[] | string> {
        switch (method) {
            //Getting Location/s using Identifier.
            case 0: {
                if (!identifier) {
                    return "An identifer is requried"
                }
                let query: Prisma.locationFindManyArgs = {};

                query.where = {
                    identifier: identifier
                }

                return await this.Prisma.location.findMany(query);
            }
            //Gettting location/s using timestamp in unix time.
            case 1: {
                if (!timeinterval) {
                    return "A time interval is required"
                }
                let query: Prisma.locationFindManyArgs = {};
                const endTime = Date.now();
                query.where = {
                    calctime: {
                        gte: timeinterval, //Greater than or equal to
                        lte: endTime, //Less than or equal to
                    },
                };
                return await this.Prisma.location.findMany(query);
            }
            //Getting n most recent location/s  
            case 2: {
                if (!n_recent) {
                    return "The number of recent locations is requried"
                }
                return await this.Prisma.location.findMany({
                    orderBy: {
                        calctime: 'desc',
                    },
                    take: n_recent,
                })
            }
            //Gettting all location
            case 3: {
                return await this.Prisma.location.findMany();
            }
        }
        return "Method is requried"
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
        identifier: string,
        calctime: number,
        x: number,
        y: number
    ) {
        await this.Prisma.location.create({
            data: {
                identifier: identifier,
                calctime: calctime,
                x: x,
                y: y,
            },
        });
    }
    async insertMeasurement(
        identifier: string,
        aid: number,
        timestamp: number,
        strengthDBM: number
    ) {
        await this.Prisma.measurement.create({
            data: {
                identifier: identifier,
                aid: aid,
                timestamp: timestamp,
                strengthDBM: strengthDBM,
            },
        });
    }

    async insertCalculations(identifier: string, calctime: number, mid: number) {
        await this.Prisma.calculation.create({
            data: {
                identifier: identifier,
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
