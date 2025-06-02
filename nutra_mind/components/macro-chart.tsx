"use client"

import { Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MacroChartProps {
  data: Array<{
    protein: number
    carbs: number
    fat: number
    date: string
  }>
}

export function MacroChart({ data }: MacroChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("de-DE", { month: "short", day: "numeric" }),
    protein: item.protein,
    carbs: item.carbs,
    fat: item.fat,
  }))

  return (
    <Card className="card-gradient glow-border">
      <CardHeader>
        <CardTitle className="high-contrast-text">Makrotrends</CardTitle>
        <CardDescription>Protein, Kohlenhydrate, Fett (Gramm)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            protein: {
              label: "Protein",
              color: "hsl(var(--chart-1))",
            },
            carbs: {
              label: "Kohlenhydrate",
              color: "hsl(var(--chart-2))",
            },
            fat: {
              label: "Fett",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[200px]"
        >
          <LineChart data={chartData}>
            <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="protein"
              stroke="var(--color-protein)"
              strokeWidth={2}
              dot={{ fill: "var(--color-protein)", strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="carbs"
              stroke="var(--color-carbs)"
              strokeWidth={2}
              dot={{ fill: "var(--color-carbs)", strokeWidth: 2, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="fat"
              stroke="var(--color-fat)"
              strokeWidth={2}
              dot={{ fill: "var(--color-fat)", strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
