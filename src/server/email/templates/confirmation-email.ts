import { getEnv } from "@/config/env";
import { buttonLink, emailLayout, escapeHtml } from "./base";

export function confirmationEmailTemplate(input: {
  email: string;
  confirmationUrl: string;
}) {
  const env = getEnv();
  const subject = "Confirmez votre email Waren";
  const body = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#3c3c37;">
      Bonjour, confirmez l'adresse <strong>${escapeHtml(input.email)}</strong> pour activer votre espace Waren.
    </p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#3c3c37;">
      Ce lien expire automatiquement. Si vous n'etes pas a l'origine de cette demande, vous pouvez ignorer cet email.
    </p>
    <p style="margin:0 0 24px;">${buttonLink("Confirmer mon email", input.confirmationUrl)}</p>
    <p style="margin:0;color:#6f6f67;font-size:13px;line-height:1.6;">
      Lien direct: <a href="${escapeHtml(input.confirmationUrl)}" style="color:#0f6b4f;">${escapeHtml(input.confirmationUrl)}</a>
    </p>`;

  return {
    subject,
    html: emailLayout({
      title: subject,
      preview: `Activez votre compte ${env.APP_NAME}`,
      body
    }),
    text: [
      `Confirmez votre email pour ${env.APP_NAME}`,
      "",
      `Ouvrez ce lien: ${input.confirmationUrl}`,
      "",
      "Waren est une plateforme de simulation et ne traite aucun ordre reel."
    ].join("\n")
  };
}
