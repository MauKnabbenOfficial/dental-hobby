import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  ListChecks,
  X,
  Check,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useData } from "@/contexts/DataContext";
import { ProcedureTemplate, ProcedureTemplateStage } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProcedureTemplates() {
  const {
    procedureTemplates,
    addProcedureTemplate,
    updateProcedureTemplate,
    deleteProcedureTemplate,
    procedureTemplateStages,
    addProcedureTemplateStage,
    updateProcedureTemplateStage,
    deleteProcedureTemplateStage,
    swapProcedureTemplateStageOrder,
    stageTemplates,
    getStagesByTemplateId,
    generateId,
  } = useData();

  const [search, setSearch] = useState("");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<ProcedureTemplate | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addingStageToTemplate, setAddingStageToTemplate] = useState<
    string | null
  >(null);
  const [stageComboOpen, setStageComboOpen] = useState(false);
  const [stageSearchValue, setStageSearchValue] = useState("");
  const [selectedStageTemplateId, setSelectedStageTemplateId] =
    useState<string>("");

  // Stage edit/details modal state
  const [editingStage, setEditingStage] =
    useState<ProcedureTemplateStage | null>(null);
  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [stageFormData, setStageFormData] = useState({
    name: "",
    description: "",
    checklistItems: [] as string[],
  });
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [deleteStageId, setDeleteStageId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    baseCost: 0,
    estimatedDuration: "",
    description: "",
  });

  const filteredTemplates = procedureTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const categoryColors: Record<string, string> = {
    Implantodontia: "bg-primary/10 text-primary",
    Endodontia: "bg-warning/10 text-warning",
    Ortodontia: "bg-accent/10 text-accent",
    Cirurgia: "bg-destructive/10 text-destructive",
    Estética: "bg-success/10 text-success",
    Preventivo: "bg-secondary text-secondary-foreground",
    Dentística: "bg-primary/10 text-primary",
    Prótese: "bg-accent/10 text-accent",
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      baseCost: 0,
      estimatedDuration: "",
      description: "",
    });
    setEditingTemplate(null);
  };

  const openEditDialog = (template: ProcedureTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      baseCost: template.baseCost,
      estimatedDuration: template.estimatedDuration,
      description: template.description,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTemplate) {
      updateProcedureTemplate(editingTemplate.id, formData);
      toast.success("Modelo atualizado!");
    } else {
      addProcedureTemplate({
        id: generateId(),
        ...formData,
      });
      toast.success("Modelo criado!");
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteProcedureTemplate(deleteId);
      toast.success("Modelo excluído!");
      setDeleteId(null);
    }
  };

  const handleAddStage = (templateId: string) => {
    const existingStages = getStagesByTemplateId(templateId);
    const newOrderIndex = existingStages.length + 1;

    // Check if it's an existing stage template or custom name
    const stageTemplate = stageTemplates.find(
      (st) => st.id === selectedStageTemplateId
    );

    const newStageId = generateId();

    if (stageTemplate) {
      // Use existing template - copy data from template
      addProcedureTemplateStage({
        id: newStageId,
        templateId,
        name: stageTemplate.name,
        orderIndex: newOrderIndex,
        description: stageTemplate.description,
        checklistItems: [...stageTemplate.checklistItems],
      });
      toast.success("Etapa adicionada a partir do modelo!");
    } else if (stageSearchValue.trim()) {
      // Create custom stage with the typed name
      const newStage: ProcedureTemplateStage = {
        id: newStageId,
        templateId,
        name: stageSearchValue.trim(),
        orderIndex: newOrderIndex,
        description: "",
        checklistItems: [],
      };
      addProcedureTemplateStage(newStage);
      toast.success("Etapa criada! Complete os detalhes.");

      // Open edit modal to complete the stage details
      setEditingStage(newStage);
      setStageFormData({
        name: newStage.name,
        description: "",
        checklistItems: [],
      });
      setIsStageFormOpen(true);
    } else {
      return; // No valid selection
    }

    setAddingStageToTemplate(null);
    setSelectedStageTemplateId("");
    setStageSearchValue("");
  };

  const handleRemoveStage = (stageId: string) => {
    deleteProcedureTemplateStage(stageId);
    toast.success("Etapa removida!");
    // Reorder remaining stages
    const stage = procedureTemplateStages.find((s) => s.id === stageId);
    if (stage) {
      const remainingStages = getStagesByTemplateId(stage.templateId).filter(
        (s) => s.id !== stageId
      );
      remainingStages.forEach((s, index) => {
        updateProcedureTemplateStage(s.id, { orderIndex: index + 1 });
      });
    }
    setDeleteStageId(null);
  };

  // Move stage up or down
  const handleMoveStage = (
    stage: ProcedureTemplateStage,
    direction: "up" | "down"
  ) => {
    const templateStages = getStagesByTemplateId(stage.templateId);
    const currentIndex = templateStages.findIndex((s) => s.id === stage.id);

    if (direction === "up" && currentIndex > 0) {
      const targetStage = templateStages[currentIndex - 1];
      swapProcedureTemplateStageOrder(stage.id, targetStage.id);
      toast.success("Ordem atualizada!");
    } else if (
      direction === "down" &&
      currentIndex < templateStages.length - 1
    ) {
      const targetStage = templateStages[currentIndex + 1];
      swapProcedureTemplateStageOrder(stage.id, targetStage.id);
      toast.success("Ordem atualizada!");
    }
  };

  // Open stage edit modal
  const openStageEditDialog = (stage: ProcedureTemplateStage) => {
    setEditingStage(stage);
    setStageFormData({
      name: stage.name,
      description: stage.description,
      checklistItems: [...stage.checklistItems],
    });
    setIsStageFormOpen(true);
  };

  // Handle stage form submit
  const handleStageFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStage) {
      updateProcedureTemplateStage(editingStage.id, stageFormData);
      toast.success("Etapa atualizada!");
      setIsStageFormOpen(false);
      resetStageForm();
    }
  };

  // Reset stage form
  const resetStageForm = () => {
    setStageFormData({ name: "", description: "", checklistItems: [] });
    setNewChecklistItem("");
    setEditingStage(null);
  };

  // Add checklist item
  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setStageFormData((prev) => ({
        ...prev,
        checklistItems: [...prev.checklistItems, newChecklistItem.trim()],
      }));
      setNewChecklistItem("");
    }
  };

  // Remove checklist item
  const removeChecklistItem = (index: number) => {
    setStageFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index),
    }));
  };

  const getSelectedStageName = () => {
    if (selectedStageTemplateId) {
      const stage = stageTemplates.find(
        (st) => st.id === selectedStageTemplateId
      );
      return stage?.name || "";
    }
    return stageSearchValue;
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Modelos de Procedimentos
          </h1>
          <p className="text-muted-foreground">
            Catálogo de serviços e etapas padrão
          </p>
        </div>
        <Dialog
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar" : "Cadastrar"} Modelo de
                Procedimento
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome do Procedimento</Label>
                  <Input
                    placeholder="Ex: Implante Dentário Unitário"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input
                    placeholder="Ex: Implantodontia"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Custo Base (R$)</Label>
                  <Input
                    type="number"
                    placeholder="0,00"
                    value={formData.baseCost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        baseCost: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label>Duração Estimada</Label>
                  <Input
                    placeholder="Ex: 3-6 meses"
                    value={formData.estimatedDuration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        estimatedDuration: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Descreva o procedimento..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTemplate ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou categoria..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="space-y-4">
        {filteredTemplates.map((template) => {
          const stages = getStagesByTemplateId(template.id);
          const isExpanded = expandedTemplate === template.id;

          return (
            <Card key={template.id} className="overflow-hidden">
              <Collapsible
                open={isExpanded}
                onOpenChange={() =>
                  setExpandedTemplate(isExpanded ? null : template.id)
                }
              >
                <CollapsibleTrigger asChild>
                  <div className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 mt-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">
                              {template.name}
                            </h3>
                            <Badge
                              className={
                                categoryColors[template.category] || "bg-muted"
                              }
                            >
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium text-foreground">
                                {formatCurrency(template.baseCost)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{template.estimatedDuration}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ListChecks className="h-4 w-4" />
                              <span>{stages.length} etapas</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(template);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(template.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-2 border-t bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        Etapas do Procedimento
                      </h4>
                      <Dialog
                        open={addingStageToTemplate === template.id}
                        onOpenChange={(open) => {
                          if (!open) {
                            setAddingStageToTemplate(null);
                            setSelectedStageTemplateId("");
                            setStageSearchValue("");
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setAddingStageToTemplate(template.id)
                            }
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Etapa
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Adicionar Etapa ao Procedimento
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Selecione ou crie uma etapa</Label>
                              <Popover
                                open={stageComboOpen}
                                onOpenChange={setStageComboOpen}
                              >
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={stageComboOpen}
                                    className="w-full justify-between mt-2"
                                  >
                                    {getSelectedStageName() ||
                                      "Escolha ou digite uma etapa..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-full p-0"
                                  align="start"
                                >
                                  <Command>
                                    <CommandInput
                                      placeholder="Buscar ou criar etapa..."
                                      value={stageSearchValue}
                                      onValueChange={(value) => {
                                        setStageSearchValue(value);
                                        setSelectedStageTemplateId("");
                                      }}
                                    />
                                    <CommandList>
                                      <CommandEmpty>
                                        {stageSearchValue.trim() && (
                                          <div className="px-2 py-3 text-sm">
                                            <p className="text-muted-foreground mb-2">
                                              Etapa não encontrada.
                                            </p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="w-full"
                                              onClick={() => {
                                                setStageComboOpen(false);
                                              }}
                                            >
                                              <Plus className="h-4 w-4 mr-2" />
                                              Criar "{stageSearchValue}"
                                            </Button>
                                          </div>
                                        )}
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {stageTemplates.map((st) => (
                                          <CommandItem
                                            key={st.id}
                                            value={st.name}
                                            onSelect={() => {
                                              setSelectedStageTemplateId(st.id);
                                              setStageSearchValue(st.name);
                                              setStageComboOpen(false);
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedStageTemplateId ===
                                                  st.id
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                            <div>
                                              <p>{st.name}</p>
                                              <p className="text-xs text-muted-foreground">
                                                {st.description}
                                              </p>
                                            </div>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <p className="text-xs text-muted-foreground mt-2">
                                Selecione uma etapa existente ou digite um nome
                                para criar uma nova.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setAddingStageToTemplate(null)}
                              >
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => handleAddStage(template.id)}
                                disabled={
                                  !selectedStageTemplateId &&
                                  !stageSearchValue.trim()
                                }
                              >
                                Adicionar
                              </Button>
                            </DialogFooter>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="space-y-3">
                      {stages.map((stage, index) => (
                        <div
                          key={stage.id}
                          className="flex gap-4 p-4 bg-card rounded-lg border"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveStage(stage, "up")}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                              {stage.orderIndex}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMoveStage(stage, "down")}
                              disabled={index === stages.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{stage.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {stage.description || (
                                <span className="italic">Sem descrição</span>
                              )}
                            </p>
                            {stage.checklistItems.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {stage.checklistItems.map((item, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openStageEditDialog(stage)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive h-8 w-8"
                              onClick={() => setDeleteStageId(stage.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {stages.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhuma etapa cadastrada. Clique em "Adicionar Etapa"
                          para começar.
                        </p>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este modelo de procedimento? As
              etapas associadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Stage Confirmation */}
      <AlertDialog
        open={!!deleteStageId}
        onOpenChange={() => setDeleteStageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão da Etapa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta etapa? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteStageId && handleRemoveStage(deleteStageId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Stage Modal */}
      <Dialog
        open={isStageFormOpen}
        onOpenChange={(open) => {
          setIsStageFormOpen(open);
          if (!open) resetStageForm();
        }}
      >
        <DialogContent
          className="max-w-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStageFormSubmit} className="space-y-4">
            <div>
              <Label>Nome da Etapa</Label>
              <Input
                placeholder="Ex: Consulta Inicial"
                value={stageFormData.name}
                onChange={(e) =>
                  setStageFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva a etapa..."
                value={stageFormData.description}
                onChange={(e) =>
                  setStageFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>
            <div>
              <Label>Itens do Checklist</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Novo item do checklist..."
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addChecklistItem())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addChecklistItem}
                >
                  Adicionar
                </Button>
              </div>
              {stageFormData.checklistItems.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {stageFormData.checklistItems.map((item, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {item}
                      <button
                        type="button"
                        onClick={() => removeChecklistItem(idx)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsStageFormOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
