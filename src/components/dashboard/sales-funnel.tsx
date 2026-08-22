import { PIPELINE_FLOW, PIPELINE_STATUS_LABEL, type PipelineStatusKey } from "@/types/domain";
import { formatCurrency } from "@/lib/utils";

interface SalesFunnelProps {
  statusCounts: Record<PipelineStatusKey, number>;
  statusValues: Record<PipelineStatusKey, number>;
}

export function SalesFunnel({ statusCounts, statusValues }: SalesFunnelProps) {
  const max = Math.max(1, ...PIPELINE_FLOW.map((s) => statusCounts[s]));
  return (
    <ul className="space-y-3">
      {PIPELINE_FLOW.map((stage, idx) => {
        const count = statusCounts[stage] ?? 0;
        const widthPct = (count / max) * 100;
        const next = PIPELINE_FLOW[idx + 1];
        const nextCount = next ? statusCounts[next] ?? 0 : 0;
        const conv = count > 0 && next ? (nextCount / count) * 100 : null;
        return (
          <li key={stage}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {PIPELINE_STATUS_LABEL[stage]}
              </span>
              <span>
                {count} cliente{count === 1 ? "" : "s"} ·{" "}
                {formatCurrency(statusValues[stage] ?? 0)}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 rounded-full bg-muted/50">
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-primary to-accent"
                style={{ width: `${Math.max(widthPct, 2)}%` }}
              />
            </div>
            {conv != null ? (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {conv.toFixed(0)}% avançam para {PIPELINE_STATUS_LABEL[next!]}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
