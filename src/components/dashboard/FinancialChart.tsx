import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";

const dailyData = [
  { name: "Seg", custoTotal: 850, mediaProc: 4.2 },
  { name: "Ter", custoTotal: 1200, mediaProc: 5.8 },
  { name: "Qua", custoTotal: 980, mediaProc: 4.5 },
  { name: "Qui", custoTotal: 1450, mediaProc: 6.2 },
  { name: "Sex", custoTotal: 1680, mediaProc: 7.0 },
  { name: "Sáb", custoTotal: 420, mediaProc: 2.5 },
];

const weeklyData = [
  { name: "Sem 1", custoTotal: 8500, mediaProc: 22 },
  { name: "Sem 2", custoTotal: 9200, mediaProc: 25 },
  { name: "Sem 3", custoTotal: 7800, mediaProc: 20 },
  { name: "Sem 4", custoTotal: 10500, mediaProc: 28 },
];

const monthlyData = [
  { name: "Jul", custoTotal: 32000, mediaProc: 85 },
  { name: "Ago", custoTotal: 38000, mediaProc: 95 },
  { name: "Set", custoTotal: 35000, mediaProc: 88 },
  { name: "Out", custoTotal: 42000, mediaProc: 105 },
  { name: "Nov", custoTotal: 39500, mediaProc: 98 },
  { name: "Dez", custoTotal: 18000, mediaProc: 48 },
];

export function FinancialChart() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const getData = () => {
    switch (period) {
      case "day": return dailyData;
      case "week": return weeklyData;
      case "month": return monthlyData;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Financeiro - Custo vs. Procedimentos</CardTitle>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <TabsList className="h-8">
            <TabsTrigger value="day" className="text-xs px-3">Dia</TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3">Semana</TabsTrigger>
            <TabsTrigger value="month" className="text-xs px-3">Mês</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={getData()} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis 
                yAxisId="left" 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                className="text-xs" 
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'custoTotal') return [formatCurrency(value), 'Custo Total'];
                  return [value, 'Média de Procedimentos'];
                }}
              />
              <Legend 
                formatter={(value) => value === 'custoTotal' ? 'Custo Total' : 'Média de Procedimentos'}
              />
              <Bar 
                yAxisId="left" 
                dataKey="custoTotal" 
                fill="hsl(210, 70%, 45%)" 
                radius={[4, 4, 0, 0]} 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="mediaProc" 
                stroke="hsl(185, 60%, 45%)" 
                strokeWidth={3}
                dot={{ fill: 'hsl(185, 60%, 45%)', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
