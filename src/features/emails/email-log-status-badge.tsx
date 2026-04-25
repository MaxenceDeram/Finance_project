import type { EmailLogStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export function EmailLogStatusBadge({ status }: { status: EmailLogStatus }) {
  return (
    <Badge variant={status === "SENT" ? "success" : "destructive"}>
      {status === "SENT" ? "Envoye" : "Echec"}
    </Badge>
  );
}
