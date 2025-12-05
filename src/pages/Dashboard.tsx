import { Calendar, Activity, DollarSign, Users, Clock } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { treatments, patients, procedureTemplates, users, getPatientById, getTemplateById, getUserById } from "@/data/mockData";

const upcomingAppointments = [
  { time: "09:00", patient: "João Pedro Oliveira", procedure: "Acompanhamento Implante", dentist: "Dr. Carlos Silva" },
  { time: "10:30", patient: "Maria Fernanda Silva", procedure: "Tratamento de Canal", dentist: "Dr. Roberto Lima" },
  { time: "11:30", patient: "Ana Beatriz Costa", procedure: "Extração de Siso", dentist: "Dr. Carlos Silva" },
  { time: "14:00", patient: "Carlos Eduardo Souza", procedure: "Manutenção Ortodontia", dentist: "Dra. Marina Santos" },
  { time: "15:30", patient: "Fernanda Lima", procedure: "Profilaxia Completa", dentist: "Dr. Roberto Lima" },
];

export default function Dashboard() {
  const inProgressTreatments = treatments.filter(t => t.status === 'in_progress');

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da clínica • Hoje, 05 de Dezembro de 2024</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Atendimentos Hoje"
          value={8}
          icon={Calendar}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Procedimentos em Andamento"
          value={inProgressTreatments.length}
          icon={Activity}
          variant="accent"
        />
        <MetricCard
          title="Faturamento do Mês"
          value="R$ 12.580"
          icon={DollarSign}
          variant="default"
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart />
        <FinancialChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Agenda de Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((apt, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-bold text-primary">{apt.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{apt.patient}</p>
                    <p className="text-xs text-muted-foreground truncate">{apt.procedure}</p>
                  </div>
                  <Badge variant="outline" className="text-xs whitespace-nowrap">
                    {apt.dentist.split(' ').slice(0, 2).join(' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Treatments */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Tratamentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inProgressTreatments.map((treatment) => {
                const patient = getPatientById(treatment.patientId);
                const template = getTemplateById(treatment.templateId);
                const dentist = getUserById(treatment.dentistId);
                
                return (
                  <div key={treatment.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {patient?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{patient?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{template?.name}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-xs">
                        {template?.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{dentist?.name.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
