import { OwnershipProps } from "@/lib/types";
import { Badge } from "@dub/ui";

export default function PlanBadge({ plan }: { plan: OwnershipProps }) {
  return (
    <Badge variant={plan === "owner" || plan === "pemilik" ? "violet" : "blue"}>
      {plan}
    </Badge>
  );
}
