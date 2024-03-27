import { z } from "zod";

/**
 * Cron interval string
 */
const cronRegex: RegExp = new RegExp(
    "/(@(annually|yearly|monthly|weekly|daily|hourly|reboot))|(@every (d+(ns|us|µs|ms|s|m|h))+)|((((d+,)+d+|(d+(/|-)d+)|d+|*) ?){5,7})/"
);
const ZodCronString = z.string().regex(cronRegex);

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

/**
 * Config file schema
 */
export const ZodConfig = z.object({
    cron_intervals: ZodCronJobs,
    filter: ZodFilterMethods,
    calculationMethod: ZodCalculationMethods,
});

export type Config = z.infer<typeof ZodConfig>;

/**
 * Define a full config
 */
export const defineConfig = ZodConfig.parse;
