import { schedule } from "node-cron";
import { log } from "mathjs";
import config from "../config.ts";
import cdm_db from "./queries.ts";
import { measurement, antennas } from "@prisma/client";
import { GetXAndY } from "./Triangulation/trilateration.ts";
import { Antenna } from "./Triangulation/Antenna.ts";
import { Coordinates } from "./Triangulation/Coordinates.ts";

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
	const data: measurement[][] = gatherMeasurementData();

	for (const measurements of data) {
		let calctime: number = Date.now();
		let coordinates: Coordinates;
		let trilaterationData: Antenna[] = [];
		let identifier: string = measurements[0].identifier;
		//All measurements with the same identifier
		for (const measurement of measurements) {
			let distance: number;
			let x: number;
			let y: number;
			distance = calculateDistance(
				config.calculationCalibration.signalStrengthCalibration0,
				measurement.strengthDBM,
				config.calculationCalibration.distanceCalibration0,
				pathLossExponent,
			);
			let jesperhaderminnaming_antenna: antennas =
				await cdm_db.getAntennasUsingAid(measurement.aid);
			//Insert the calculations
			cdm_db
				.insertCalculations(
					measurement.identifier,
					calctime,
					measurement.mid,
				)
				.catch((error: Error) => {
					console.log(error);
				});

			trilaterationData.push({
				x: jesperhaderminnaming_antenna.x,
				y: jesperhaderminnaming_antenna.y,
				distance: distance,
			});
		}
		//Calculate the coordinates for
		coordinates = GetXAndY(trilaterationData);
		//Insert the location into the database
		cdm_db
			.insertLocations(identifier, calctime, coordinates.x, coordinates.y)
			.catch((error: Error) => {
				console.log(error);
			});
	}
}

function gatherMeasurementData(): measurement[][] {
	switch (config.filter.method) {
		case "none":
			cdm_db
				.getNNewestMeasurements()
				.then((measurements: measurement[][]) => {
					return measurements;
				})
				.catch((error: Error) => {
					console.error(error);
					return [];
				});
			break;

		case "NAverage":
			cdm_db
				.getNNewestMeasurements(config.filter.n)
				.then((measurementsPrIdentifier: measurement[][]) => {
					// FILTER AND CALCULATE THE AVERAGE
					let sanatizedData: measurement[][] = [];
					measurementsPrIdentifier.forEach((measurements) => {
						let sumDBM: number;
						let avgDBM: number;
						let avgx: number;
						let avgy: number;
						let timestamp: number = measurements[0].timestamp;

						measurements.forEach((measurement) => {
							sumDBM += measurement.strengthDBM;
							console.log(
								`Identifier: ${measurement.identifier} Timestamp: ${measurement.timestamp}`,
							);
						});
					});

					return measurementsPrIdentifier; // Change return to filtered data
				})
				.catch((error: Error) => {
					console.error(error);
					return [];
				});
			break;
	}

	return [];
}

function calculateDistance(
	calibratedStrength: number,
	snStrength1: number,
	calibratedDistance: number,
	pathLossExponent: number,
) {
	return (
		10 ^
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
