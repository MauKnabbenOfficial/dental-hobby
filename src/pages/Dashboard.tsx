import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Activity, DollarSign, Clock, Play, Download, FileText, User } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

const upcomingAppointments = [
  { time: "09:00", patient: "João Pedro Oliveira", procedure: "Acompanhamento Implante", dentist: "Dr. Carlos Silva" },
  { time: "10:30", patient: "Maria Fernanda Silva", procedure: "Tratamento de Canal", dentist: "Dr. Roberto Lima" },
  { time: "11:30", patient: "Ana Beatriz Costa", procedure: "Extração de Siso", dentist: "Dr. Carlos Silva" },
  { time: "14:00", patient: "Carlos Eduardo Souza", procedure: "Manutenção Ortodontia", dentist: "Dra. Marina Santos" },
  { time: "15:30", patient: "Fernanda Lima", procedure: "Profilaxia Completa", dentist: "Dr. Roberto Lima" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { treatments, treatmentStages, patients, procedureTemplates, users, financialRecords, getPatientById, getTemplateById, getUserById, getStagesByTreatmentId } = useData();
  
  const inProgressTreatments = treatments.filter(t => t.status === 'in_progress');
  
  // Find current appointment (happening right now)
  const currentAppointment = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    
    // Find stages scheduled for today
    for (const treatment of inProgressTreatments) {
      const stages = getStagesByTreatmentId(treatment.id);
      const currentStage = stages.find(s => s.status === 'in_progress');
      if (currentStage?.scheduledDate === today) {
        return {
          treatment,
          stage: currentStage,
          patient: getPatientById(treatment.patientId),
          template: getTemplateById(treatment.templateId),
          dentist: getUserById(treatment.dentistId)
        };
      }
    }
    
    // Fallback to first in-progress treatment for demo
    if (inProgressTreatments.length > 0) {
      const treatment = inProgressTreatments[0];
      const stages = getStagesByTreatmentId(treatment.id);
      const currentStage = stages.find(s => s.status === 'in_progress');
      return {
        treatment,
        stage: currentStage,
        patient: getPatientById(treatment.patientId),
        template: getTemplateById(treatment.templateId),
        dentist: getUserById(treatment.dentistId)
      };
    }
    
    return null;
  }, [inProgressTreatments, getStagesByTreatmentId, getPatientById, getTemplateById, getUserById]);

  // Calculate metrics
  const monthlyRevenue = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return financialRecords
      .filter(r => r.type === 'income' && r.date.startsWith(currentMonth.slice(0, 4)))
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  const handleExportPDF = () => {
    // Generate PDF report
    const reportData = {
      date: new Date().toLocaleDateString('pt-BR'),
      metrics: {
        appointments: 8,
        inProgress: inProgressTreatments.length,
        revenue: monthlyRevenue
      },
      treatments: inProgressTreatments.map(t => ({
        patient: getPatientById(t.patientId)?.name,
        procedure: getTemplateById(t.templateId)?.name,
        dentist: getUserById(t.dentistId)?.name
      }))
    };

    // Create a simple text report
    const reportContent = `
RELATÓRIO DENTALTRACK
Data: ${reportData.date}
================================

MÉTRICAS DO DIA
- Atendimentos Hoje: ${reportData.metrics.appointments}
- Procedimentos em Andamento: ${reportData.metrics.inProgress}
- Faturamento do Mês: R$ ${reportData.metrics.revenue.toLocaleString('pt-BR')}

TRATAMENTOS ATIVOS
${reportData.treatments.map((t, i) => `${i + 1}. ${t.patient} - ${t.procedure} (${t.dentist})`).join('\n')}
    `;

    // Create and download file
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-dentaltrack-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Relatório exportado!');
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da clínica • Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatórios
        </Button>
      </div>

      {/* Current Appointment Card */}
      {currentAppointment && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              Atendimento Agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {currentAppointment.patient?.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{currentAppointment.patient?.name}</h3>
                  <p className="text-muted-foreground">{currentAppointment.template?.name}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <User className="h-3 w-3" />
                      {currentAppointment.dentist?.name}
                    </span>
                    <Badge variant="secondary">{currentAppointment.stage?.name}</Badge>
                  </div>
                </div>
              </div>
              <Button onClick={() => navigate('/atendimentos')}>
                <Play className="h-4 w-4 mr-2" />
                Abrir Atendimento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR')}`}
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
              {inProgressTreatments.slice(0, 5).map((treatment) => {
                const patient = getPatientById(treatment.patientId);
                const template = getTemplateById(treatment.templateId);
                const dentist = getUserById(treatment.dentistId);
                
                return (
                  <div key={treatment.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer" onClick={() => navigate('/atendimentos')}>
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
