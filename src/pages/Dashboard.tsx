import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Activity, DollarSign, Clock, Play, Download, FileText, User, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const upcomingAppointments = [
  { time: "09:00", patient: "João Pedro Oliveira", procedure: "Acompanhamento Implante", dentist: "Dr. Carlos Silva" },
  { time: "10:30", patient: "Maria Fernanda Silva", procedure: "Tratamento de Canal", dentist: "Dr. Roberto Lima" },
  { time: "11:30", patient: "Ana Beatriz Costa", procedure: "Extração de Siso", dentist: "Dr. Carlos Silva" },
  { time: "14:00", patient: "Carlos Eduardo Souza", procedure: "Manutenção Ortodontia", dentist: "Dra. Marina Santos" },
  { time: "15:30", patient: "Fernanda Lima", procedure: "Profilaxia Completa", dentist: "Dr. Roberto Lima" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { treatments, treatmentStages, patients, procedureTemplates, users, financialRecords, getPatientById, getTemplateById, getUserById, getStagesByTreatmentId } = useData();
  
  const inProgressTreatments = treatments.filter(t => t.status === 'in_progress');
  
  // Find current appointment (happening right now)
  const currentAppointment = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
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
    const currentYear = new Date().toISOString().slice(0, 4);
    return financialRecords
      .filter(r => r.type === 'income' && r.date.startsWith(currentYear))
      .reduce((sum, r) => sum + r.amount, 0);
  }, [financialRecords]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsExporting(true);
    toast.info('Gerando relatório PDF...');
    
    try {
      // Capture the dashboard content
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1200,
      });
      
      // Create PDF in landscape A4
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio * 0.95;
      const finalHeight = imgHeight * ratio * 0.95;
      
      // Center the image
      const x = (pdfWidth - finalWidth) / 2;
      const y = 10;
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(41, 98, 255);
      pdf.text('DentalTrack - Relatório Dashboard', pdfWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pdfWidth / 2, 22, { align: 'center' });
      
      // Add the captured image
      pdf.addImage(imgData, 'PNG', x, 28, finalWidth, finalHeight - 20);
      
      // Save the PDF
      pdf.save(`relatorio-dentaltrack-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da clínica • Hoje, {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {isExporting ? 'Gerando...' : 'Exportar Relatórios'}
        </Button>
      </div>

      {/* Content to be captured for PDF */}
      <div ref={reportRef}>
        {/* Current Appointment Card */}
        {currentAppointment && (
          <Card className="border-2 border-primary bg-primary/5 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
    </div>
  );
}
