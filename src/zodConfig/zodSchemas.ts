import { z } from "zod";

/**
 * Cron interval string
 */

const ZodCronString = z.string();

export type CronString = z.infer<typeof ZodCronString>;

const ZodCronJobs = z
	.object({
		locationCalculation: ZodCronString,
	})
	.strict();

export type CronJobs = z.infer<typeof ZodCronJobs>;

/**
 * Measurement filtering method
 */
const ZodFilterMethods = z.discriminatedUnion("method", [
	z.object({
		method: z.literal("none"),
	}),
	z.object({
		method: z.literal("NAverage"),
		n: z.number().positive().int().default(1),
	}),
]);

export type FilterMethod = z.infer<typeof ZodFilterMethods>;

/**
 * Calculation method
 */
const supportedCalculationMethods = ["default", "other"] as const;
const ZodCalculationMethods = z.enum(supportedCalculationMethods);

export type CalculationMethod = z.infer<typeof ZodCalculationMethods>;

const ZodCalculationCalibration = z.object({
	signalStrengthCalibration0: z.number().default(0),
	signalStrengthCalibration1: z.number().default(0),
	distanceCalibration0: z.number().default(0),
	distanceCalibration1: z.number().default(0),
});
export type CalculationCalibration = z.infer<typeof ZodCalculationCalibration>;

/**
 * Config file schema
 */
export const ZodConfig = z.object({
	cron_intervals: ZodCronJobs,
	filter: ZodFilterMethods,
	calculationMethod: ZodCalculationMethods,
	calculationCalibration: ZodCalculationCalibration,
});

export type Config = z.infer<typeof ZodConfig>;

/**
 * Define a full config
 */
export const defineConfig = ZodConfig.parse;
