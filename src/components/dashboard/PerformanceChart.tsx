import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState } from "react";

const dailyData = [
  { name: "Seg", Implante: 2, Ortodontia: 4, Endodontia: 3, Preventivo: 8 },
  { name: "Ter", Implante: 1, Ortodontia: 5, Endodontia: 2, Preventivo: 10 },
  { name: "Qua", Implante: 3, Ortodontia: 3, Endodontia: 4, Preventivo: 7 },
  { name: "Qui", Implante: 2, Ortodontia: 6, Endodontia: 2, Preventivo: 9 },
  { name: "Sex", Implante: 1, Ortodontia: 4, Endodontia: 3, Preventivo: 12 },
  { name: "Sáb", Implante: 0, Ortodontia: 2, Endodontia: 1, Preventivo: 5 },
];

const weeklyData = [
  { name: "Sem 1", Implante: 8, Ortodontia: 22, Endodontia: 15, Preventivo: 45 },
  { name: "Sem 2", Implante: 10, Ortodontia: 25, Endodontia: 12, Preventivo: 50 },
  { name: "Sem 3", Implante: 6, Ortodontia: 20, Endodontia: 18, Preventivo: 42 },
  { name: "Sem 4", Implante: 9, Ortodontia: 24, Endodontia: 14, Preventivo: 48 },
];

const monthlyData = [
  { name: "Jul", Implante: 28, Ortodontia: 85, Endodontia: 45, Preventivo: 180 },
  { name: "Ago", Implante: 32, Ortodontia: 90, Endodontia: 52, Preventivo: 195 },
  { name: "Set", Implante: 25, Ortodontia: 78, Endodontia: 48, Preventivo: 170 },
  { name: "Out", Implante: 35, Ortodontia: 95, Endodontia: 55, Preventivo: 200 },
  { name: "Nov", Implante: 30, Ortodontia: 88, Endodontia: 50, Preventivo: 185 },
  { name: "Dez", Implante: 18, Ortodontia: 45, Endodontia: 28, Preventivo: 95 },
];

export function PerformanceChart() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");

  const getData = () => {
    switch (period) {
      case "day": return dailyData;
      case "week": return weeklyData;
      case "month": return monthlyData;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Desempenho - Atendimentos</CardTitle>
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
            <BarChart data={getData()} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="Implante" fill="hsl(210, 70%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Ortodontia" fill="hsl(185, 60%, 45%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Endodontia" fill="hsl(38, 90%, 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Preventivo" fill="hsl(145, 60%, 40%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
