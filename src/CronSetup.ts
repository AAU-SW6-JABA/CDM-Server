import { schedule } from "node-cron";

/**
 * List of cron jobs to be added
 */
const cronJobs: { interval: string; jobFunction: () => void }[] = [
    { interval: "*/10 * * * * *", jobFunction: calculateLocations },
];

/**
 * Functions for the cron jobs
 */
function calculateLocations(): void {
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
