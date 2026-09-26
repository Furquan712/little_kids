"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipContentProps,
} from "recharts";

export type TrendPoint = { month: string; value: number };

function monthLabel(month: string, locale: string): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1, 1);
  return new Intl.DateTimeFormat(locale, { month: "short" }).format(date);
}

function compactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function ChartTooltip({
  active,
  payload,
  locale,
  unit,
}: TooltipContentProps & { locale: string; unit: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  const month = (point.payload as TrendPoint | undefined)?.month;
  if (!month) return null;

  return (
    <div className="rounded-xl border border-plat-border bg-plat-bg px-3.5 py-2.5 shadow-lg shadow-plat-ink/10">
      <p className="text-base font-semibold text-plat-ink">
        {new Intl.NumberFormat(locale).format(Number(point.value))}{" "}
        <span className="text-xs font-normal text-plat-ink-muted">{unit}</span>
      </p>
      <p className="text-xs capitalize text-plat-ink-muted">{monthLabel(month, locale)}</p>
    </div>
  );
}

export function TrendChart({
  data,
  color,
  unit,
}: {
  data: TrendPoint[];
  color: string;
  unit: string;
}) {
  const locale = useLocale();
  const t = useTranslations("common");
  const gradientId = `trend-fill-${color.replace("#", "")}`;
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-plat-ink-muted">
        {t("noChartData")}
      </div>
    );
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--plat-border)" strokeDasharray="0" />
          <XAxis
            dataKey="month"
            tickFormatter={(value: string) => monthLabel(value, locale)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--plat-ink-muted)", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={(value: number) => compactNumber(value, locale)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--plat-ink-muted)", fontSize: 12 }}
            width={44}
          />
          <Tooltip
            content={(props: TooltipContentProps) => <ChartTooltip {...props} locale={locale} unit={unit} />}
            cursor={{ stroke: "var(--plat-border)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 4, fill: color, stroke: "var(--plat-bg)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: color, stroke: "var(--plat-bg)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
