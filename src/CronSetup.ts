import { schedule } from "node-cron";
import { log } from "mathjs";
import config from "../config.ts";
import cdm_db, { GroupedMeasurements } from "./queries.ts";
import { antennas } from "@prisma/client";
import { GetXAndY } from "./Trilateration/trilateration.ts";
import { TrilaterationData } from "./Trilateration/TrilaterationData.ts";
import { Coordinates } from "./Trilateration/Coordinates.ts";
import { newLocations } from "./Locations.ts";
import { DefaultMap } from "./DefaultMap.ts";

/**
 * List of cron jobs to be added
 */
const cronJobs: { interval: string; jobFunction: () => void }[] = [
	{
		interval: config.cron_intervals.locationCalculation,
		jobFunction: calculateLocations,
	},
];

/**
 * Function for setting up cron schedules
 */
export default function setupCronSchedule() {
	cronJobs.forEach((job) => {
		schedule(job.interval, job.jobFunction);
	});
}

/**
 * Functions for the cron jobs
 */
async function calculateLocations() {
	const pathLossExponent: number = getPathLossExponent(
		config.calculationCalibration.signalStrengthCalibration1,
		config.calculationCalibration.signalStrengthCalibration0,
		config.calculationCalibration.distanceCalibration1,
		config.calculationCalibration.distanceCalibration0,
	);
	const data: GroupedMeasurements = await gatherMeasurementData();

	for (const [identifier, idMeasurements] of data) {
		const calctime: number = Date.now();
		let coordinates: Coordinates;
		const trilaterationData: TrilaterationData[] = [];
		//All measurements with the same identifier
		for (const [antId, antMeasurements] of idMeasurements) {
			const antenna: antennas = await cdm_db.getAntennasUsingAid(antId);
			for (const [timestamp, measurement] of antMeasurements) {
				let distance: number;
				distance = calculateDistance(
					config.calculationCalibration.signalStrengthCalibration0,
					measurement.strengthDBM,
					config.calculationCalibration.distanceCalibration0,
					pathLossExponent,
				);

				trilaterationData.push({
					x: antenna.x,
					y: antenna.y,
					distance: distance,
				});
			}
		}
		//Calculate the coordinates for
		coordinates = GetXAndY(trilaterationData);
		//Insert the location into the database
		//Insert the calculations
		await cdm_db
			.insertLocations(identifier, calctime, coordinates.x, coordinates.y)
			.catch((error: Error) => {
				console.log(error);
			});
		//send data to subscribers => locations
		newLocations.push({
			identifier,
			calctime,
			x: coordinates.x,
			y: coordinates.y,
		});
	}
}

async function gatherMeasurementData(): Promise<GroupedMeasurements> {
	let data: GroupedMeasurements = new DefaultMap(
		() => new DefaultMap(() => new Map()),
	);
	switch (config.filter.method) {
		case "none":
			try {
				data = await cdm_db.getNewestMeasurements(
					Date.now() - config.filter.last,
				); // TODO: sæt en værdi her som ikke er hard coded
			} catch (error) {
				console.error(error);
			}
			break;

		case "NAverage":
			try {
				data = await cdm_db.getNewestMeasurements(
					Date.now() - config.filter.last,
				);
			} catch (error) {
				console.error(error);
			}
			data = averageMeasurements(data);
			break;
	}
	return data;
}

function calculateDistance(
	calibratedStrength: number,
	snStrength1: number,
	calibratedDistance: number,
	pathLossExponent: number,
): number {
	return (
		10 **
		((-(calibratedStrength - snStrength1) / (10 * pathLossExponent)) *
			calibratedDistance)
	);
}
/*Propagation model
	* P_hat(d) = P_0 - 10 * n * log10(d/d_0) + X_gaussian_random_variable
	
	*d isolated:
	* d=10 ^ (-(s-s_0)/ (10 * n))* d_0
	* s : signal strength
	* 
	* n = - ((ln(10) * s - ln(10) * s_0) / (10 * ln(d/d_0)))
	*/

function getPathLossExponent(
	snStrength0: number,
	snStrength: number,
	distance0: number,
	distance: number,
): number {
	return (
		-1 *
		((log(10) * snStrength - log(10) * snStrength0) /
			(10 * log(distance / distance0)))
	);
}

export type AveragedAntennaMeasurements = DefaultMap<
	string,
	Map<number, number>
>;

function averageMeasurements(data: GroupedMeasurements): GroupedMeasurements {
	const averagedData: GroupedMeasurements = new DefaultMap(
		() => new DefaultMap(() => new Map()),
	);
	for (const [identifier, idMeasurements] of data) {
		const averagedDataId = averagedData.getSet(identifier);
		for (const [antId, antMeasurements] of idMeasurements) {
			let sum: number = 0;
			let count: number = 0;
			let timestampSum = 0;
			const mids: number[] = [];
			for (const [timestamp, measurement] of antMeasurements) {
				sum += measurement.strengthDBM;
				timestampSum += timestamp;
				count++;
				timestampSum = timestamp;
				if (Array.isArray(measurement.mid)) {
					mids.push(...measurement.mid);
				} else {
					mids.push(measurement.mid);
				}
			}
			const average: number = sum / count;
			const averageTimestamp = timestampSum / count;
			const timestampMap = new Map();
			timestampMap.set(averageTimestamp, {
				mid: mids,
				strengthDBM: average,
			});
			averagedDataId.set(antId, timestampMap);
		}
	}

	return averagedData;
}
