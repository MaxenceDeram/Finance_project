import { getEnv } from "@/config/env";

export function emailLayout(input: { title: string; preview: string; body: string }) {
  const env = getEnv();

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;background:#f6f7f9;font-family:Inter,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #e5e7eb;">
                <div style="font-size:13px;color:#64748b;letter-spacing:.08em;text-transform:uppercase;">${escapeHtml(env.APP_NAME)}</div>
                <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#111827;">${escapeHtml(input.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">${input.body}</td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #e5e7eb;color:#64748b;font-size:12px;line-height:1.6;">
                Plateforme de simulation uniquement. Aucun ordre reel, conseil financier ou service de courtage n'est fourni.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buttonLink(label: string, href: string) {
  return `<a href="${escapeAttribute(href)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;padding:12px 18px;font-weight:700;font-size:14px;">${escapeHtml(label)}</a>`;
}

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
