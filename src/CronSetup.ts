import { schedule } from "node-cron";

import config from "../config.ts";
import cdm_db from "./queries.ts";
import { measurement } from "@prisma/client";

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
function calculateLocations() {
	console.log("moin");

	const data: measurement[][] = gaterMeasurementData();
	console.log(`Got measurements for ${data.length} locations`);
}

function gaterMeasurementData(): measurement[][] {
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
					measurementsPrIdentifier.forEach((measurements) => {
						measurements.forEach((measurement) => {
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
