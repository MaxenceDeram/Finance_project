import { formatDateOnly } from "@/lib/dates";

export type FollowUpTemplateContext = {
  companyName: string;
  roleTitle: string;
  contactName?: string | null;
  contactEmail?: string | null;
  applicationDate?: Date | null;
  userName: string;
  userEmail: string;
  today: Date;
};

const tokenResolvers: Record<
  string,
  (context: FollowUpTemplateContext) => string
> = {
  companyName: (context) => context.companyName,
  roleTitle: (context) => context.roleTitle,
  contactName: (context) => context.contactName || "",
  contactEmail: (context) => context.contactEmail || "",
  applicationDate: (context) =>
    context.applicationDate ? formatDateOnly(context.applicationDate) : "",
  userName: (context) => context.userName,
  userEmail: (context) => context.userEmail,
  today: (context) => formatDateOnly(context.today)
};

export function renderTemplateString(
  template: string,
  context: FollowUpTemplateContext
) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, tokenName: string) => {
    const resolver = tokenResolvers[tokenName];
    return resolver ? resolver(context) : "";
  });
}

export function getFollowUpTemplateTokens() {
  return [
    "{{companyName}}",
    "{{roleTitle}}",
    "{{contactName}}",
    "{{contactEmail}}",
    "{{applicationDate}}",
    "{{userName}}",
    "{{userEmail}}",
    "{{today}}"
  ];
}
