"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from "recharts";

export type PipelinePoint = { status: string; label: string; count: number };

function BarTooltip({ active, payload, locale }: TooltipContentProps & { locale: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const label = (point.payload as PipelinePoint | undefined)?.label;
  if (!label) return null;

  return (
    <div className="rounded-xl border border-plat-border bg-plat-bg px-3.5 py-2.5 shadow-lg shadow-plat-ink/10">
      <p className="text-base font-semibold text-plat-ink">{new Intl.NumberFormat(locale).format(Number(point.value))}</p>
      <p className="text-xs text-plat-ink-muted">{label}</p>
    </div>
  );
}

export function PipelineBarChart({ data, color }: { data: PipelinePoint[]; color: string }) {
  const locale = useLocale();
  const t = useTranslations("common");
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-plat-ink-muted">
        {t("noChartData")}
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }} barCategoryGap={10}>
          <CartesianGrid horizontal={false} stroke="var(--plat-border)" strokeDasharray="0" />
          <XAxis
            type="number"
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--plat-ink-muted)", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            axisLine={false}
            tickLine={false}
            width={110}
            tick={{ fill: "var(--plat-ink)", fontSize: 12 }}
          />
          <Tooltip
            content={(props: TooltipContentProps) => <BarTooltip {...props} locale={locale} />}
            cursor={{ fill: "var(--plat-bg-pink)" }}
          />
          <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
