import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Clock, Circle, FileText, Calendar, Upload, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TreatmentStage } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HorizontalTimelineProps {
  stages: TreatmentStage[];
  patientName: string;
  treatmentName: string;
  onStageUpdate?: (stageId: string, data: Partial<TreatmentStage>) => void;
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

export function HorizontalTimeline({ stages, patientName, treatmentName, onStageUpdate }: HorizontalTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = useState<TreatmentStage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    status: '' as TreatmentStage['status'],
    notes: '',
    diagnosis: '',
    attachments: [] as string[]
  });
  const [attachmentToDelete, setAttachmentToDelete] = useState<{ index: number; name: string } | null>(null);

  // Scroll to current stage on mount
  useEffect(() => {
    if (scrollRef.current && stages.length > 0) {
      const currentStageIndex = stages.findIndex(s => s.status === 'in_progress');
      if (currentStageIndex > 0) {
        const stageWidth = 288;
        const scrollPosition = (currentStageIndex * stageWidth) - (scrollRef.current.clientWidth / 2) + (stageWidth / 2);
        scrollRef.current.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
      }
    }
  }, [stages]);

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

  const openEditDialog = (stage: TreatmentStage) => {
    setSelectedStage(stage);
    setEditForm({
      status: stage.status,
      notes: stage.notes || '',
      diagnosis: '',
      attachments: stage.attachments || []
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedStage && onStageUpdate) {
      onStageUpdate(selectedStage.id, {
        status: editForm.status,
        notes: editForm.notes,
        attachments: editForm.attachments
      });
    }
    setIsEditing(false);
    setSelectedStage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(f => f.name);
      setEditForm(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
    }
  };

  const confirmDeleteAttachment = () => {
    if (attachmentToDelete !== null) {
      setEditForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== attachmentToDelete.index)
      }));
      setAttachmentToDelete(null);
    }
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
        {/* Timeline Track - Container with sticky buttons */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-8 left-12 right-12 h-0.5 bg-border z-0" />
          
          {/* Left Navigation Button - Sticky */}
          <div className="absolute left-0 top-0 bottom-0 z-30 flex items-center pointer-events-none">
            <Button 
              variant="secondary" 
              size="icon" 
              className="shadow-lg pointer-events-auto bg-background/95 backdrop-blur-sm hover:bg-background"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Right Navigation Button - Sticky */}
          <div className="absolute right-0 top-0 bottom-0 z-30 flex items-center pointer-events-none">
            <Button 
              variant="secondary" 
              size="icon" 
              className="shadow-lg pointer-events-auto bg-background/95 backdrop-blur-sm hover:bg-background"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            className="overflow-x-auto pb-4 timeline-scroll mx-10"
          >
            <div className="flex gap-4 min-w-max px-2 pt-2">
              {stages.map((stage, index) => {
                const config = statusConfig[stage.status];
                const StatusIcon = config.icon;
                const isLast = index === stages.length - 1;
                const isCurrent = stage.status === 'in_progress';
                
                return (
                  <div key={stage.id} className="relative flex flex-col items-center">
                    {/* Node */}
                    <button
                      onClick={() => openEditDialog(stage)}
                      className={cn(
                        "relative z-10 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all hover:scale-110 bg-card",
                        config.borderColor,
                        isCurrent && "ring-4 ring-primary/30 animate-pulse"
                      )}
                    >
                      <StatusIcon className={cn("h-6 w-6", config.textColor)} />
                    </button>
                    
                    {/* Stage Card */}
                    <div
                      onClick={() => openEditDialog(stage)}
                      className={cn(
                        "mt-4 w-64 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        stage.status === "in_progress" && "border-primary bg-primary/5 ring-2 ring-primary/20",
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
                      {stage.notes && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{stage.notes}</p>
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

      {/* Stage Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Editar Etapa: {selectedStage?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedStage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Etapa {selectedStage.orderIndex} de {stages.length}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={(value: TreatmentStage['status']) => setEditForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="skipped">Pulado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data Agendada</Label>
                  <Input type="date" defaultValue={selectedStage.scheduledDate} disabled />
                </div>
              </div>
              
              <div>
                <Label>Observações</Label>
                <Textarea 
                  placeholder="Adicione observações sobre esta etapa..." 
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div>
                <Label>Diagnóstico</Label>
                <Textarea 
                  placeholder="Diagnóstico ou achados clínicos..." 
                  value={editForm.diagnosis}
                  onChange={(e) => setEditForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <div>
                <Label>Anexos</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Clique para adicionar arquivos</span>
                    <input type="file" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                {editForm.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editForm.attachments.map((file, idx) => (
                      <Badge key={idx} variant="secondary" className="gap-1 pr-1">
                        <FileText className="h-3 w-3" />
                        {file}
                        <button 
                          type="button"
                          onClick={() => setAttachmentToDelete({ index: idx, name: file })}
                          className="ml-1 p-0.5 rounded hover:bg-destructive/20 text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Attachment Delete Confirmation */}
      <AlertDialog open={!!attachmentToDelete} onOpenChange={() => setAttachmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Anexo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o anexo <strong>"{attachmentToDelete?.name}"</strong> do paciente <strong>{patientName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAttachment} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
