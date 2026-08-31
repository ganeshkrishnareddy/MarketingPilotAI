"use client"

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  { date: "Jan 1", reach: 12000, engagement: 2400 },
  { date: "Jan 5", reach: 18000, engagement: 3200 },
  { date: "Jan 10", reach: 15000, engagement: 2800 },
  { date: "Jan 15", reach: 24000, engagement: 4200 },
  { date: "Jan 20", reach: 28000, engagement: 5100 },
  { date: "Jan 25", reach: 35000, engagement: 6800 },
  { date: "Jan 30", reach: 42000, engagement: 8400 },
]

export function DashboardChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} 
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "hsl(var(--card))", 
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
            }}
            itemStyle={{ color: "hsl(var(--foreground))", fontSize: "14px" }}
          />
          <Area 
            type="monotone" 
            dataKey="reach" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorReach)" 
          />
          <Area 
            type="monotone" 
            dataKey="engagement" 
            stroke="hsl(var(--chart-2))" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEngagement)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
