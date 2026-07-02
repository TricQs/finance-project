"use client"

import { useId, useState } from "react"

import { formatCompactCurrency } from "@/lib/format-currency"

type WeeklyDatum = { day: string; income: number; expense: number }

type WeeklyBarChartProps = {
  data: WeeklyDatum[]
}

const WIDTH = 700
const HEIGHT = 260
const PADDING_BOTTOM = 28
const BAR_GROUP_GAP = 14
const BAR_GAP = 6

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const max = Math.max(...data.flatMap((d) => [d.income, d.expense]), 1)
  const chartHeight = HEIGHT - PADDING_BOTTOM
  const groupWidth = (WIDTH - BAR_GROUP_GAP * (data.length - 1)) / data.length
  const barWidth = (groupWidth - BAR_GAP) / 2

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`income-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--income)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--income)" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`expense-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--expense)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--expense)" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={0}
            x2={WIDTH}
            y1={chartHeight * (1 - t)}
            y2={chartHeight * (1 - t)}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ))}

        {data.map((d, i) => {
          const groupX = i * (groupWidth + BAR_GROUP_GAP)
          const incomeHeight = (d.income / max) * chartHeight
          const expenseHeight = (d.expense / max) * chartHeight
          const isHovered = hoverIndex === i

          return (
            <g
              key={d.day}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              className="cursor-pointer"
            >
              <rect
                x={groupX}
                y={chartHeight - incomeHeight}
                width={barWidth}
                height={Math.max(incomeHeight, 2)}
                rx={6}
                fill={`url(#income-${gradientId})`}
                opacity={isHovered || hoverIndex === null ? 1 : 0.4}
              />
              <rect
                x={groupX + barWidth + BAR_GAP}
                y={chartHeight - expenseHeight}
                width={barWidth}
                height={Math.max(expenseHeight, 2)}
                rx={6}
                fill={`url(#expense-${gradientId})`}
                opacity={isHovered || hoverIndex === null ? 1 : 0.4}
              />
              <text
                x={groupX + groupWidth / 2}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize={12}
                fill="var(--muted-foreground)"
              >
                {d.day}
              </text>
            </g>
          )
        })}
      </svg>

      {hoverIndex !== null && (
        <div
          className="neu-raised-sm pointer-events-none absolute -top-2 flex flex-col gap-1 rounded-xl px-3 py-2 text-xs"
          style={{
            left: `${
              ((hoverIndex * (groupWidth + BAR_GROUP_GAP) + groupWidth / 2) /
                WIDTH) *
              100
            }%`,
            transform: "translate(-50%, -100%)",
          }}
        >
          <span className="font-medium text-foreground">
            {data[hoverIndex].day}
          </span>
          <span style={{ color: "var(--income)" }}>
            Masuk {formatCompactCurrency(data[hoverIndex].income)}
          </span>
          <span style={{ color: "var(--expense)" }}>
            Keluar {formatCompactCurrency(data[hoverIndex].expense)}
          </span>
        </div>
      )}
    </div>
  )
}