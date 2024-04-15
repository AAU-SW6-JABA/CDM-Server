import { defineConfig } from "./src/zodConfig/zodSchemas.ts";

export default defineConfig({
	cron_intervals: {
		locationCalculation: "*/10 * * * * *",
	},
	filter: {
		method: "none",
	},
	calculationMethod: "default",
	calculationCalibration: {
		signalStrengthCalibration0: -2,
		signalStrengthCalibration1: -6,
		distanceCalibration0: 2,
		distanceCalibration1: 10,
	},
});
