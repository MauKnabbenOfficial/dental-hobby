import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Clock, Circle, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { TreatmentStage } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HorizontalTimelineProps {
  stages: TreatmentStage[];
  patientName: string;
  treatmentName: string;
}

const statusConfig = {
  completed: {
    icon: Check,
    bgColor: "bg-success",
    borderColor: "border-success",
    textColor: "text-success",
    label: "Concluído"
  },
  in_progress: {
    icon: Clock,
    bgColor: "bg-primary",
    borderColor: "border-primary",
    textColor: "text-primary",
    label: "Em Andamento"
  },
  pending: {
    icon: Circle,
    bgColor: "bg-muted",
    borderColor: "border-muted-foreground/30",
    textColor: "text-muted-foreground",
    label: "Pendente"
  },
  skipped: {
    icon: Circle,
    bgColor: "bg-muted",
    borderColor: "border-muted-foreground/30",
    textColor: "text-muted-foreground/50",
    label: "Pulado"
  }
};

export function HorizontalTimeline({ stages, patientName, treatmentName }: HorizontalTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = useState<TreatmentStage | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "dd MMM yyyy", { locale: ptBR });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{treatmentName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Paciente: {patientName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => scroll("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => scroll("right")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline Track */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-border" />
          
          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="overflow-x-auto pb-4 timeline-scroll"
          >
            <div className="flex gap-4 min-w-max px-2 pt-2">
              {stages.map((stage, index) => {
                const config = statusConfig[stage.status];
                const StatusIcon = config.icon;
                const isLast = index === stages.length - 1;
                
                return (
                  <div key={stage.id} className="relative flex flex-col items-center">
                    {/* Node */}
                    <button
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        "relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-transform hover:scale-110 bg-card",
                        config.borderColor
                      )}
                    >
                      <StatusIcon className={cn("h-6 w-6", config.textColor)} />
                    </button>
                    
                    {/* Stage Card */}
                    <div
                      onClick={() => setSelectedStage(stage)}
                      className={cn(
                        "mt-4 w-64 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        stage.status === "in_progress" && "border-primary bg-primary/5",
                        stage.status === "completed" && "border-success/30 bg-success/5",
                        stage.status === "pending" && "bg-card hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          Etapa {stage.orderIndex}
                        </span>
                        <Badge variant={stage.status === "completed" ? "default" : stage.status === "in_progress" ? "secondary" : "outline"} className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-2 line-clamp-2">{stage.name}</h4>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(stage.scheduledDate)}</span>
                      </div>
                      {stage.dateCompleted && (
                        <div className="flex items-center gap-1 text-xs text-success mt-1">
                          <Check className="h-3 w-3" />
                          <span>Concluído: {formatDate(stage.dateCompleted)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Connector Arrow */}
                    {!isLast && (
                      <div className="absolute top-8 left-[calc(100%+8px)] w-4 h-0.5 bg-border" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Stage Detail Dialog */}
      <Dialog open={!!selectedStage} onOpenChange={() => setSelectedStage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedStage?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedStage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={selectedStage.status === "completed" ? "default" : selectedStage.status === "in_progress" ? "secondary" : "outline"}>
                  {statusConfig[selectedStage.status].label}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Etapa {selectedStage.orderIndex} de {stages.length}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Agendado para</p>
                  <p className="font-medium">{formatDate(selectedStage.scheduledDate)}</p>
                </div>
                {selectedStage.dateCompleted && (
                  <div>
                    <p className="text-muted-foreground">Concluído em</p>
                    <p className="font-medium text-success">{formatDate(selectedStage.dateCompleted)}</p>
                  </div>
                )}
              </div>
              
              {selectedStage.notes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm bg-muted p-3 rounded-lg">{selectedStage.notes}</p>
                </div>
              )}
              
              {selectedStage.attachments && selectedStage.attachments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Anexos</p>
                  <div className="space-y-2">
                    {selectedStage.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm">{attachment}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
