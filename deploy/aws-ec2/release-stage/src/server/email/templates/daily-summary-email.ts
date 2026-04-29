import type { ApplicationStatus } from "@prisma/client";
import { formatDateOnly } from "@/lib/dates";
import { buttonLink, emailLayout, escapeHtml } from "./base";
import { getApplicationStatusLabel } from "@/features/applications/constants";

export type DailySummaryEmailInput = {
  totalApplications: number;
  responseRate: number;
  upcomingFollowUps: Array<{
    companyName: string;
    roleTitle: string;
    status: ApplicationStatus;
    followUpDate: Date;
  }>;
  recentApplications: Array<{
    companyName: string;
    roleTitle: string;
    status: ApplicationStatus;
    applicationDate: Date;
  }>;
  dashboardUrl: string;
};

export function dailySummaryEmailTemplate(input: DailySummaryEmailInput) {
  const subject = "Waren - Rappel quotidien candidatures";

  const followUpRows = input.upcomingFollowUps
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #efefea;">
          <strong>${escapeHtml(item.companyName)}</strong><br>
          <span style="color:#6f6f67;font-size:12px;">${escapeHtml(item.roleTitle)}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #efefea;">
          ${escapeHtml(getApplicationStatusLabel(item.status))}<br>
          <span style="color:#6f6f67;font-size:12px;">${escapeHtml(formatDateOnly(item.followUpDate))}</span>
        </td>
      </tr>`
    )
    .join("");

  const recentRows = input.recentApplications
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #efefea;">
          <strong>${escapeHtml(item.companyName)}</strong><br>
          <span style="color:#6f6f67;font-size:12px;">${escapeHtml(item.roleTitle)}</span>
        </td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #efefea;">
          ${escapeHtml(getApplicationStatusLabel(item.status))}<br>
          <span style="color:#6f6f67;font-size:12px;">${escapeHtml(formatDateOnly(item.applicationDate))}</span>
        </td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3c3c37;">
      Voici votre recap Waren du jour pour garder le fil sur vos candidatures.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:14px;border:1px solid #deded6;border-radius:8px;">
          <div style="color:#6f6f67;font-size:12px;text-transform:uppercase;">Total</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px;">${input.totalApplications}</div>
        </td>
        <td width="12"></td>
        <td style="padding:14px;border:1px solid #deded6;border-radius:8px;">
          <div style="color:#6f6f67;font-size:12px;text-transform:uppercase;">Taux de reponse</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px;">${input.responseRate}%</div>
        </td>
      </tr>
    </table>
    <h2 style="font-size:16px;margin:0 0 8px;">Prochaines relances</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      ${followUpRows || "<tr><td style='color:#6f6f67;'>Aucune relance planifiee pour le moment.</td></tr>"}
    </table>
    <h2 style="font-size:16px;margin:0 0 8px;">Candidatures recentes</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      ${recentRows || "<tr><td style='color:#6f6f67;'>Aucune candidature recente.</td></tr>"}
    </table>
    <p style="margin:0;">${buttonLink("Ouvrir Waren", input.dashboardUrl)}</p>
  `;

  return {
    subject,
    html: emailLayout({
      title: subject,
      preview: `${input.totalApplications} candidature(s) - ${input.upcomingFollowUps.length} relance(s) a surveiller`,
      body
    }),
    text: [
      subject,
      "",
      `Total candidatures: ${input.totalApplications}`,
      `Taux de reponse: ${input.responseRate}%`,
      "",
      "Ouvrir le dashboard:",
      input.dashboardUrl
    ].join("\n")
  };
}
