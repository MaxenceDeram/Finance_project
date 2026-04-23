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
  <body style="margin:0;background:#f7f7f3;font-family:Inter,Arial,sans-serif;color:#11110f;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f3;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #deded6;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid #deded6;">
                <div style="font-size:18px;color:#11110f;font-weight:700;">${escapeHtml(env.APP_NAME)}</div>
                <h1 style="margin:12px 0 0;font-size:24px;line-height:1.25;color:#11110f;">${escapeHtml(input.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">${input.body}</td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #deded6;color:#6f6f67;font-size:12px;line-height:1.6;">
                Espace personnel Waren. Vos donnees restent liees a votre compte et a votre suivi prive.
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
  return `<a href="${escapeAttribute(href)}" style="display:inline-block;background:#11110f;color:#ffffff;text-decoration:none;border-radius:6px;padding:12px 18px;font-weight:700;font-size:14px;">${escapeHtml(label)}</a>`;
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
