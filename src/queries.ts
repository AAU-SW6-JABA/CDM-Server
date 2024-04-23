import { Prisma, PrismaClient } from "@prisma/client";
import type {
	antennas,
	location,
	calculation,
	measurement,
} from "@prisma/client";
import { DefaultMap } from "./DefaultMap.ts";

export type GroupedMeasurements = DefaultMap<
	string,
	DefaultMap<
		number,
		Map<number, { mid: number | number[]; strengthDBM: number }>
	>
>;

class CDMDatabase {
	public Prisma: PrismaClient;

	constructor() {
		this.Prisma = new PrismaClient();
	}

	async getLocation(
		n_recent?: number,
		timestart?: number,
		timeend?: number,
		identifer?: string[],
	): Promise<location[]> {
		//Set default value for n_recent

		//insure that timestart and timeend are defined the correct way
		let correctStartTime;
		let correctEndTime;
		//If both are defined
		if (typeof timestart != "undefined" && typeof timeend != "undefined") {
			if (timestart < timeend) {
				correctStartTime = timeend;
				correctEndTime = timestart;
			} else {
				correctStartTime = timestart;
				correctEndTime = timeend;
			}
			//if only timeend is defined
		} else if (
			typeof timestart == "undefined" &&
			typeof timeend != "undefined"
		) {
			correctStartTime = timeend;
			correctEndTime = 0;
			//if only timestart is defined
		} else if (
			typeof timeend == "undefined" &&
			typeof timestart != "undefined"
		) {
			correctEndTime = 0;
			correctStartTime = timestart;
			//if none are defined
		} else {
			correctStartTime = Date.now();
			correctEndTime = 0;
		}

		//Checks whether the query should be based on a specific identifier or all
		if (typeof identifer == "undefined") {
			identifer = [];
			const data = await this.Prisma.location.findMany({
				select: { identifier: true },
				distinct: ["identifier"],
			});
			identifer.push(...data.map((row) => row.identifier));
		}
		let locations: location[] = [];
		if (n_recent != undefined) {
			for (let id of identifer) {
				let recentlocations = await this.Prisma.location.findMany({
					where: {
						identifier: id,
						calctime: {
							lte: correctStartTime,
							gte: correctEndTime,
						},
					},
					take: n_recent,
					orderBy: { calctime: "desc" },
				});
				locations.push(...recentlocations);
			}
			return locations;
		} else {
			let locations: location[] = [];
			for (let id of identifer) {
				let recentlocations = await this.Prisma.location.findMany({
					where: {
						identifier: id,
						calctime: {
							lte: correctStartTime,
							gte: correctEndTime,
						},
					},
					orderBy: { calctime: "desc" },
				});
				locations.push(...recentlocations);
			}
			return locations;
		}
	}

	async getAllMeasurements(): Promise<measurement[]> {
		return await this.Prisma.measurement.findMany();
	}
	/*
	 *	Struktur af hvad ✨regnbue✨ vi gerne vil have
	 *	[imsi1: [antenne1: [measurements], antenne2: [measurements]], imsi2: [...],  imsi3: [...]]
	 */
	async getNewestMeasurements(limit: number): Promise<GroupedMeasurements> {
		const measurements = await this.Prisma.measurement.findMany({
			orderBy: [
				{
					identifier: "asc",
				},
				{
					aid: "asc",
				},
				{
					timestamp: "asc",
				},
			],
			where: {
				timestamp: {
					gt: limit,
				},
			},
		});
		const groupedMeasurements: GroupedMeasurements = new DefaultMap(
			() => new DefaultMap(() => new Map()),
		);
		for (const measurement of measurements) {
			const identifierMeasurements = groupedMeasurements.getSet(
				measurement.identifier,
			);
			const antennaMeasurements = identifierMeasurements.getSet(
				measurement.aid,
			);
			antennaMeasurements.set(measurement.timestamp, {
				mid: measurement.mid,
				strengthDBM: measurement.strengthDBM,
			});
		}
		return groupedMeasurements;
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

	async resetDB() {
		const tableNames = [
			"calculation",
			"location",
			"measurement",
			"antennas",
		];

		try {
			tableNames.forEach(async (tableName) => {
				await this.Prisma.$executeRawUnsafe(
					`TRUNCATE TABLE ${tableName} CASCADE;`,
				);
			});
		} catch (error) {
			console.log({ error });
		}
	}
}

const cdm_db = new CDMDatabase();
export default cdm_db;
