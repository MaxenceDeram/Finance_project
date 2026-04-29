import { runDailySummaryJob } from "../src/features/jobs/daily-summary";

const result = await runDailySummaryJob();
console.log(JSON.stringify(result, null, 2));
