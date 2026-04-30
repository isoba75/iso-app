import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon } from "lucide-react"
import { readFile } from "@/lib/github"

interface StatCard {
  label: string
  value: string
  trend: "up" | "down" | "neutral"
  trendLabel: string
  detail: string
}

async function getFinanceStats(): Promise<StatCard[]> {
  try {
    const raw = await readFile("Personal Finances/memory/CONTEXT.md")

    const nwMatch = raw.match(/net.?worth[:\s]+€?([\d,]+)/i)
    const netWorth = nwMatch ? `€${nwMatch[1]}` : "—"

    const revMatch = raw.match(/revolut[:\s]+€?([\d,]+)/i)
    const revolut = revMatch ? `€${revMatch[1]}` : "—"

    const salMatch = raw.match(/(?:salary|income|net salary)[:\s]+€?([\d,]+)/i)
    const salary = salMatch ? `€${salMatch[1]}` : "—"

    const vuaaMatch = raw.match(/vuaa[:\s]+([^\n]+)/i)
    const vuaa = vuaaMatch ? vuaaMatch[1].trim().slice(0, 20) : "—"

    return [
      {
        label: "Net Worth",
        value: netWorth,
        trend: "up",
        trendLabel: "Tracking up",
        detail: "From CONTEXT.md",
      },
      {
        label: "Revolut Loan",
        value: revolut,
        trend: "down",
        trendLabel: "Paying down",
        detail: "Target: May 2026",
      },
      {
        label: "Monthly Income",
        value: salary,
        trend: "neutral",
        trendLabel: "Stable",
        detail: "Net EUR",
      },
      {
        label: "VUAA",
        value: vuaa,
        trend: "up",
        trendLabel: "Coming soon",
        detail: "After Revolut cleared",
      },
    ]
  } catch {
    return []
  }
}

export async function IsoStatCards() {
  const stats = await getFinanceStats()

  if (stats.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat) => (
        <Card key={stat.label} className="@container/card">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {stat.trend === "up" && <TrendingUpIcon />}
                {stat.trend === "down" && <TrendingDownIcon />}
                {stat.trend === "neutral" && <MinusIcon />}
                {stat.trendLabel}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="text-muted-foreground">{stat.detail}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
