import { NextResponse } from "next/server";
import { getEnv } from "@/config/env";
import { runDailySummaryJob } from "@/features/jobs/daily-summary";

export async function POST(request: Request) {
  const env = getEnv();
  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailySummaryJob();
  return NextResponse.json(result);
}
