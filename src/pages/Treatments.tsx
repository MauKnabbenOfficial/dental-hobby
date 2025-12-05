import { useState } from "react";
import { Plus, Search, Eye, Calendar, User, Stethoscope, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { HorizontalTimeline } from "@/components/timeline/HorizontalTimeline";
import { useData, ExtendedFinancialRecord } from "@/contexts/DataContext";
import { Treatment } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const statusConfig = {
  scheduled: { label: "Agendado", variant: "outline" as const },
  in_progress: { label: "Em Andamento", variant: "default" as const },
  completed: { label: "Concluído", variant: "secondary" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const },
};

export default function Treatments() {
  const { 
    treatments, addTreatment, updateTreatment, deleteTreatment,
    patients, procedureTemplates, users,
    treatmentStages, addTreatmentStage, updateTreatmentStage,
    financialRecords, addFinancialRecord,
    getPatientById, getTemplateById, getUserById, getStagesByTreatmentId, getStagesByTemplateId,
    generateId
  } = useData();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    templateId: '',
    dentistId: '',
    startDate: '',
    totalCost: 0,
    notes: '',
    createFinancialRecord: false
  });

  const filteredTreatments = treatments.filter(t => {
    const patient = getPatientById(t.patientId);
    const template = getTemplateById(t.templateId);
    const matchesSearch = patient?.name.toLowerCase().includes(search.toLowerCase()) ||
                          template?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const dentists = users.filter(u => u.role === 'dentist' || u.role === 'admin');

  const resetForm = () => {
    setFormData({ patientId: '', templateId: '', dentistId: '', startDate: '', totalCost: 0, notes: '', createFinancialRecord: false });
    setEditingTreatment(null);
  };

  const openEditDialog = (treatment: Treatment) => {
    setEditingTreatment(treatment);
    setFormData({
      patientId: treatment.patientId,
      templateId: treatment.templateId,
      dentistId: treatment.dentistId,
      startDate: treatment.startDate,
      totalCost: treatment.totalCost,
      notes: treatment.notes || '',
      createFinancialRecord: false
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTreatment) {
      updateTreatment(editingTreatment.id, {
        ...formData,
        status: editingTreatment.status
      });
      toast.success('Atendimento atualizado!');
    } else {
      const treatmentId = generateId();
      const template = getTemplateById(formData.templateId);
      const templateStages = getStagesByTemplateId(formData.templateId);
      
      // Create treatment
      addTreatment({
        id: treatmentId,
        patientId: formData.patientId,
        templateId: formData.templateId,
        dentistId: formData.dentistId,
        startDate: formData.startDate,
        totalCost: formData.totalCost || template?.baseCost || 0,
        notes: formData.notes,
        status: 'scheduled',
        currentStageId: ''
      });
      
      // Copy stages from template
      templateStages.forEach((stage, index) => {
        addTreatmentStage({
          id: generateId(),
          treatmentId,
          name: stage.name,
          status: index === 0 ? 'in_progress' : 'pending',
          orderIndex: stage.orderIndex,
          scheduledDate: formData.startDate,
          notes: ''
        });
      });
      
      // Create financial record if requested
      if (formData.createFinancialRecord && template) {
        const record: ExtendedFinancialRecord = {
          id: generateId(),
          treatmentId,
          type: 'income',
          amount: formData.totalCost || template.baseCost,
          date: formData.startDate,
          description: `${template.name} - ${getPatientById(formData.patientId)?.name}`,
          category: template.category,
          status: 'pending'
        };
        addFinancialRecord(record);
      }
      
      toast.success('Atendimento criado!');
    }
    
    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTreatment(deleteId);
      toast.success('Atendimento excluído!');
      setDeleteId(null);
    }
  };

  const handleStageUpdate = (stageId: string, data: Partial<typeof treatmentStages[0]>) => {
    updateTreatmentStage(stageId, data);
    toast.success('Etapa atualizada!');
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Atendimentos</h1>
          <p className="text-muted-foreground">Tratamentos ativos e histórico de pacientes</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Atendimento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTreatment ? 'Editar' : 'Iniciar Novo'} Atendimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Paciente</Label>
                <Select value={formData.patientId} onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Procedimento</Label>
                <Select 
                  value={formData.templateId} 
                  onValueChange={(value) => {
                    const template = getTemplateById(value);
                    setFormData(prev => ({ 
                      ...prev, 
                      templateId: value,
                      totalCost: template?.baseCost || 0
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo de procedimento" />
                  </SelectTrigger>
                  <SelectContent>
                    {procedureTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} - {formatCurrency(t.baseCost)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Dentista Responsável</Label>
                <Select value={formData.dentistId} onValueChange={(value) => setFormData(prev => ({ ...prev, dentistId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dentista" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <Input 
                    type="date" 
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label>Valor Total (R$)</Label>
                  <Input 
                    type="number" 
                    value={formData.totalCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalCost: Number(e.target.value) }))}
                  />
                </div>
              </div>
              {!editingTreatment && (
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="createFinancial" 
                    checked={formData.createFinancialRecord}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createFinancialRecord: !!checked }))}
                  />
                  <label htmlFor="createFinancial" className="text-sm font-medium leading-none cursor-pointer">
                    Gerar lançamento financeiro (Conta a Receber)
                  </label>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingTreatment ? 'Salvar' : 'Iniciar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente ou procedimento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Atendimentos ({filteredTreatments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Procedimento</TableHead>
                <TableHead>Dentista</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTreatments.map((treatment) => {
                const patient = getPatientById(treatment.patientId);
                const template = getTemplateById(treatment.templateId);
                const dentist = getUserById(treatment.dentistId);
                const stages = getStagesByTreatmentId(treatment.id);
                const completedStages = stages.filter(s => s.status === 'completed').length;

                return (
                  <TableRow key={treatment.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{patient?.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{template?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {completedStages}/{stages.length} etapas
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span>{dentist?.name.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(treatment.startDate)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(treatment.totalCost)}</TableCell>
                    <TableCell>
                      <Badge variant={statusConfig[treatment.status].variant}>
                        {statusConfig[treatment.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedTreatment(treatment)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(treatment)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(treatment.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Treatment Detail Dialog with Timeline */}
      <Dialog open={!!selectedTreatment} onOpenChange={() => setSelectedTreatment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Atendimento</DialogTitle>
          </DialogHeader>
          {selectedTreatment && (
            <Tabs defaultValue="timeline" className="mt-4">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="info">Informações</TabsTrigger>
              </TabsList>
              <TabsContent value="timeline" className="mt-4">
                <HorizontalTimeline
                  stages={getStagesByTreatmentId(selectedTreatment.id)}
                  patientName={getPatientById(selectedTreatment.patientId)?.name || ''}
                  treatmentName={getTemplateById(selectedTreatment.templateId)?.name || ''}
                  onStageUpdate={handleStageUpdate}
                />
              </TabsContent>
              <TabsContent value="info" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Paciente</p>
                    <p className="font-medium">{getPatientById(selectedTreatment.patientId)?.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Procedimento</p>
                    <p className="font-medium">{getTemplateById(selectedTreatment.templateId)?.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Dentista</p>
                    <p className="font-medium">{getUserById(selectedTreatment.dentistId)?.name}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-medium">{formatCurrency(selectedTreatment.totalCost)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Data de Início</p>
                    <p className="font-medium">{formatDate(selectedTreatment.startDate)}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={statusConfig[selectedTreatment.status].variant}>
                      {statusConfig[selectedTreatment.status].label}
                    </Badge>
                  </div>
                </div>
                {selectedTreatment.notes && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p>{selectedTreatment.notes}</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este atendimento? As etapas e dados associados também serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
