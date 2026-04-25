import { buttonLink, emailLayout, escapeHtml } from "./base";

export function applicationFollowUpEmailTemplate(input: {
  subject: string;
  message: string;
  companyName: string;
  roleTitle: string;
  applicationUrl: string;
}) {
  const paragraphs = input.message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#3c3c37;">${escapeHtml(paragraph)}</p>`
    )
    .join("");

  const body = `
    <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6f6f67;">
      Relance candidature
    </p>
    <div style="margin:0 0 24px;padding:16px;border:1px solid #e6e8ef;border-radius:14px;background:#f8faff;">
      <div style="font-size:14px;font-weight:700;color:#101828;">${escapeHtml(input.companyName)}</div>
      <div style="margin-top:4px;font-size:13px;color:#667085;">${escapeHtml(input.roleTitle)}</div>
    </div>
    ${paragraphs}
    <p style="margin:0;">${buttonLink("Ouvrir la fiche Waren", input.applicationUrl)}</p>
  `;

  return {
    subject: input.subject,
    html: emailLayout({
      title: input.subject,
      preview: `${input.companyName} · ${input.roleTitle}`,
      body
    }),
    text: [input.subject, "", input.companyName, input.roleTitle, "", input.message].join("\n")
  };
}
