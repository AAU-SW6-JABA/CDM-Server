import { schedule } from "node-cron";

import config from "../config";
import cdm_db from "./queries";
import { location, measurement } from "@prisma/client";

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
 * Filter function for the cron jobs
 */
function filter(): void {
	// String type should be corrected to be a Location array
	// This function would look something like:
	// 1. Get data and filter based on config
	// 2. Call calculation function on input
	// 3. Insert newly calculated locations into database
}

function gaterMeasurementData(): measurement[][] {
	switch (config.filter.method) {
		case "none":
			cdm_db.getNNewestMeasurements().then((measurements) => {
				return measurements;
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
				});
			break;
	}

	return [];
}

/**
 * Functions for the cron jobs
 */
function calculateLocations() {
	const data: measurement[][] = gaterMeasurementData();

	console.log("Calculated locations");
}

/**
 * Function for setting up cron schedules
 */
export default function setupCronSchedule() {
	cronJobs.forEach((job) => {
		schedule(job.interval, job.jobFunction);
	});
}
