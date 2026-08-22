"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: { month: string; value: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasData = data.some((d) => d.value > 0);
  return (
    <div className="h-64 w-full">
      {hasData ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(265 90% 60%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(265 90% 60%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 6% 18%)" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="hsl(240 6% 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              stroke="hsl(240 6% 65%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$${Math.round(v / 1000)}k`}
              width={56}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(240 8% 9%)",
                border: "1px solid hsl(240 6% 18%)",
                borderRadius: 12,
                color: "hsl(240 12% 96%)",
              }}
              formatter={(v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number(v))}
              cursor={{ stroke: "hsl(265 90% 60%)", strokeWidth: 1, strokeDasharray: "3 3" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="hsl(265 90% 60%)"
              strokeWidth={2.5}
              fill="url(#revPurple)"
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="grid h-full place-items-center text-sm text-muted-foreground">
          Ainda sem fechamentos para exibir.
        </div>
      )}
    </div>
  );
}
