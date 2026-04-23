import { AdminDailySummaryJobForm } from "@/features/admin/admin-job-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/server/security/sessions";

export default async function AdminJobsPage() {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-normal text-muted-foreground">
          Administration
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal">Jobs</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Les actions manuelles sont rate-limitees et journalisees dans les audit logs.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recap quotidien</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminDailySummaryJobForm />
        </CardContent>
      </Card>
    </div>
  );
}
