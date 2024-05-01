import { defineConfig } from "./src/zodConfig/zodSchemas.ts";

export default defineConfig({
	cron_intervals: {
		locationCalculation: "*/2 * * * * *",
	},
	filter: {
		method: "NAverage",
		last: 10_000,
	},
	calculationMethod: "default",
	calculationCalibration: {
		signalStrengthCalibration0: -20,
		signalStrengthCalibration1: -70,
		distanceCalibration0: 1,
		distanceCalibration1: 10,
	},
});
