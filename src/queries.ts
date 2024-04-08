import { Prisma, PrismaClient } from "@prisma/client";
import type {
	antennas,
	location,
	calculation,
	measurement,
} from "@prisma/client";

class CDMDatabase {
	public Prisma: PrismaClient;

	constructor() {
		this.Prisma = new PrismaClient();
	}

	async getLocation(
		method: number,
		identifier?: string,
		timeinterval?: number,
		n_recent?: number,
	): Promise<location[]> {
		switch (method) {
			//Getting Location/s using Identifier.
			case 0: {
				if (!identifier) {
					throw new Error("An identifer is requried");
				}
				const query: Prisma.locationFindManyArgs = {};

				query.where = {
					identifier: identifier,
				};

				return await this.Prisma.location.findMany(query);
			}
			//Gettting location/s using timestamp in unix time.
			case 1: {
				if (!timeinterval) {
					throw new Error("A time interval is required");
				}
				const query: Prisma.locationFindManyArgs = {};
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
					throw new Error(
						"The number of recent locations is requried",
					);
				}
				return await this.Prisma.location.findMany({
					orderBy: {
						calctime: "desc",
					},
					take: n_recent,
				});
			}
			//Gettting all location
			case 3: {
				return await this.Prisma.location.findMany();
			}
		}
		throw new Error("Method is requried");
	}

	async getAllMeasurements(): Promise<measurement[]> {
		return await this.Prisma.measurement.findMany();
	}

	async getNNewestMeasurements(n: number = 1): Promise<measurement[][]> {
		const identifiers = await this.Prisma.measurement.findMany({
			select: {
				identifier: true,
			},
			distinct: ["identifier"],
		});

		const promises = identifiers.map((identifier) =>
			this.Prisma.measurement.findMany({
				where: {
					identifier: identifier.identifier,
				},
				orderBy: {
					timestamp: "desc",
				},
				take: n,
			}),
		);

		const measurements = Promise.all(promises);

		return measurements;
	}

	async getMeasurementsBetweenTimestamps(
		startTime: number,
		endTime: number,
	): Promise<measurement[]> {
		const query: Prisma.measurementFindFirstArgs = {};

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

	async getAntennasUsingAid(aid: number): Promise<antennas> {
		const query: Prisma.antennasFindManyArgs = {};

		if (aid) {
			query.where = {
				aid: aid,
			};
		}

		return await this.Prisma.antennas.findFirstOrThrow(query);
	}

	async getAllAntennas(): Promise<antennas[]> {
		return await this.Prisma.antennas.findMany();
	}

	async getMeasurementsBasedOnLocation(
		identifer: string,
		calctime: number,
	): Promise<location[]> {
		//Finding all measurements based on calculations
		return this.Prisma.location.findMany({
			where: { identifier: identifer, calctime: calctime },
			include: { calculation: true },
		});
	}

	async insertLocations(
		identifier: string,
		calctime: number,
		x: number,
		y: number,
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
		strengthDBM: number,
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

	async insertCalculations(
		identifier: string,
		calctime: number,
		mid: number,
	) {
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

const cdm_db = new CDMDatabase();
export default cdm_db;
