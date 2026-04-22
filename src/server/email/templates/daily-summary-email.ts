import { formatMoney, formatPercent, formatSignedMoney } from "@/lib/format";
import { buttonLink, emailLayout, escapeHtml } from "./base";

export type DailySummaryEmailInput = {
  portfolioName: string;
  currency: string;
  totalValue: number;
  dailyChangeAmount: number;
  dailyChangePercent: number;
  totalPerformancePercent: number;
  topMovers: Array<{
    symbol: string;
    name: string;
    pnl: number;
    pnlPercent: number;
  }>;
  positions: Array<{
    symbol: string;
    name: string;
    value: number;
    weight: number;
  }>;
  dashboardUrl: string;
};

export function dailySummaryEmailTemplate(input: DailySummaryEmailInput) {
  const subject = `Synthese quotidienne - ${input.portfolioName}`;
  const moversRows = input.topMovers
    .slice(0, 5)
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f7;"><strong>${escapeHtml(item.symbol)}</strong><br><span style="color:#64748b;font-size:12px;">${escapeHtml(item.name)}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #eef2f7;">${formatSignedMoney(item.pnl, input.currency)}<br><span style="color:#64748b;font-size:12px;">${formatPercent(item.pnlPercent)}</span></td>
      </tr>`
    )
    .join("");

  const positionRows = input.positions
    .slice(0, 6)
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f7;"><strong>${escapeHtml(item.symbol)}</strong><br><span style="color:#64748b;font-size:12px;">${escapeHtml(item.name)}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #eef2f7;">${formatMoney(item.value, input.currency)}<br><span style="color:#64748b;font-size:12px;">${formatPercent(item.weight)}</span></td>
      </tr>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#374151;">
      Resume de fin de journee pour <strong>${escapeHtml(input.portfolioName)}</strong>.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td style="padding:14px;border:1px solid #e5e7eb;border-radius:10px;">
          <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Valeur totale</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px;">${formatMoney(input.totalValue, input.currency)}</div>
        </td>
        <td width="12"></td>
        <td style="padding:14px;border:1px solid #e5e7eb;border-radius:10px;">
          <div style="color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.08em;">Jour</div>
          <div style="font-size:24px;font-weight:800;margin-top:4px;">${formatSignedMoney(input.dailyChangeAmount, input.currency)}</div>
          <div style="color:#64748b;font-size:12px;">${formatPercent(input.dailyChangePercent)}</div>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 20px;color:#374151;">Performance totale: <strong>${formatPercent(input.totalPerformancePercent)}</strong></p>
    <h2 style="font-size:16px;margin:0 0 8px;">Top variations</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${moversRows || "<tr><td style='color:#64748b;'>Aucune position ouverte.</td></tr>"}</table>
    <h2 style="font-size:16px;margin:0 0 8px;">Principales positions</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">${positionRows || "<tr><td style='color:#64748b;'>Aucune position ouverte.</td></tr>"}</table>
    <p style="margin:0;">${buttonLink("Ouvrir le dashboard", input.dashboardUrl)}</p>
  `;

  return {
    subject,
    html: emailLayout({
      title: subject,
      preview: `Valeur: ${formatMoney(input.totalValue, input.currency)} - Jour: ${formatPercent(input.dailyChangePercent)}`,
      body
    }),
    text: [
      subject,
      "",
      `Valeur totale: ${formatMoney(input.totalValue, input.currency)}`,
      `Evolution du jour: ${formatSignedMoney(input.dailyChangeAmount, input.currency)} (${formatPercent(input.dailyChangePercent)})`,
      `Performance totale: ${formatPercent(input.totalPerformancePercent)}`,
      "",
      input.dashboardUrl
    ].join("\n")
  };
}
