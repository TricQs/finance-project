import { formatCurrency } from "@/lib/format-currency"

type CategoryDatum = { category: string; amount: number; color: string }

type CategoryBreakdownProps = {
  data: CategoryDatum[]
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      {data.map((d) => {
        const percent = total > 0 ? (d.amount / total) * 100 : 0
        return (
          <div key={d.category} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-foreground">{d.category}</span>
              </div>
              <span className="font-medium text-foreground">
                {formatCurrency(d.amount)}
              </span>
            </div>
            <div className="neu-pressed-sm h-2 w-full overflow-hidden rounded-full">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percent}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}