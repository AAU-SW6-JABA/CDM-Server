import { defineConfig } from "./src/zodConfig/zodSchemas.ts";

export default defineConfig({
	cron_intervals: {
		locationCalculation: "*/10 * * * * *",
	},
	filter: {
		method: "NAverage",
		last: 10_000,
	},
	calculationMethod: "default",
	calculationCalibration: {
		signalStrengthCalibration0: -28,
		signalStrengthCalibration1: -96,
		distanceCalibration0: 1,
		distanceCalibration1: 10,
	},
});
