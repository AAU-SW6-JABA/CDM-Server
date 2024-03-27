import { defineConfig } from "./src/zodConfig/zodSchemas";

export default defineConfig({
	cron_intervals: {
		locationCalculation: "*/10 * * * * *",
	},
	filter: {
		method: "none",
	},
	calculationMethod: "default",
});
