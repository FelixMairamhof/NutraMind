"use client"

import { Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface WeightChartProps {
  data: Array<{
    weight: number
    date: string
  }>
}

export function WeightChart({ data }: WeightChartProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("de-DE", { month: "short", day: "numeric" }),
    weight: item.weight,
  }))

  const weightChange = data.length >= 2 ? (data[data.length - 1].weight - data[0].weight).toFixed(1) : "0"

  return (
    <Card className="card-gradient glow-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between high-contrast-text">
          Gewichtsverlauf
          {data.length >= 2 && (
            <span className={`text-sm ${Number.parseFloat(weightChange) >= 0 ? "text-red-500" : "text-green-500"}`}>
              {Number.parseFloat(weightChange) >= 0 ? "+" : ""}
              {weightChange} kg
            </span>
          )}
        </CardTitle>
        <CardDescription>Gewichtsverfolgung im Zeitverlauf</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            weight: {
              label: "Gewicht (kg)",
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
              dataKey="weight"
              stroke="var(--color-weight)"
              strokeWidth={3}
              dot={{ fill: "var(--color-weight)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "var(--color-weight)", strokeWidth: 2 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
