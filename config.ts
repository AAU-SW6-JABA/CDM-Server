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
		signalStrengthCalibration0: 0,
		signalStrengthCalibration1: 0,
		distanceCalibration0: 0,
		distanceCalibration1: 0,
	},
});
