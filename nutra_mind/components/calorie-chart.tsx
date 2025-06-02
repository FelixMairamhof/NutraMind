"use client"

import { Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CalorieChartProps {
  data: Array<{
    calories: number
    date: string
  }>
}

export function CalorieChart({ data }: CalorieChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("de-DE", { month: "short", day: "numeric" }),
    calories: item.calories,
  }))

  return (
    <Card className="card-gradient glow-border">
      <CardHeader>
        <CardTitle className="high-contrast-text">Kalorientrend</CardTitle>
        <CardDescription>Letzte 7 Tage</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            calories: {
              label: "Kalorien",
              color: "hsl(var(--primary))",
            },
          }}
          className="h-[200px]"
        >
          <LineChart data={chartData}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} labelFormatter={(value) => `Datum: ${value}`} />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="var(--color-calories)"
              strokeWidth={3}
              dot={{ fill: "var(--color-calories)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "var(--color-calories)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
