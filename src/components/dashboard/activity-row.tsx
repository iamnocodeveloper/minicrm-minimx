import { Badge } from "@/components/ui/badge";
import {
  ActivityTypeKey,
  ACTIVITY_TYPE_LABEL,
} from "@/types/domain";
import {
  PhoneCall,
  Mail,
  Users,
  MessageCircle,
  StickyNote,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";

const ICONS: Record<ActivityTypeKey, React.ComponentType<{ className?: string }>> = {
  call: PhoneCall,
  email: Mail,
  meeting: Users,
  whatsapp: MessageCircle,
  note: StickyNote,
};

export function ActivityRow({
  activity,
  clientName,
}: {
  activity: { id: string; type: ActivityTypeKey; title: string; description: string | null; created_at: string };
  clientName?: string;
}) {
  const Icon = ICONS[activity.type];
  return (
    <li className="flex items-start gap-3 rounded-lg border border-border bg-card/40 p-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {activity.title}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="muted" className="capitalize">
            {ACTIVITY_TYPE_LABEL[activity.type]}
          </Badge>
          {clientName ? <span>· {clientName}</span> : null}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">
        {relativeTime(activity.created_at)}
      </span>
    </li>
  );
}
