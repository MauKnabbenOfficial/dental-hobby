import { useState } from "react";
import { Plus, Search, Edit, Trash2, Clock, ListChecks, X } from "lucide-react";
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
import { useData, StageTemplate } from "@/contexts/DataContext";
import { toast } from "sonner";

export default function StageTemplates() {
  const {
    stageTemplates,
    addStageTemplate,
    updateStageTemplate,
    deleteStageTemplate,
    generateId,
  } = useData();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StageTemplate | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    defaultDuration: "",
    checklistItems: [] as string[],
  });
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const filteredTemplates = stageTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      defaultDuration: "",
      checklistItems: [],
    });
    setNewChecklistItem("");
    setEditingTemplate(null);
  };

  const openEditDialog = (template: StageTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description,
      defaultDuration: template.defaultDuration,
      checklistItems: [...template.checklistItems],
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTemplate) {
      updateStageTemplate(editingTemplate.id, formData);
      toast.success("Modelo de etapa atualizado!");
    } else {
      addStageTemplate({
        id: generateId(),
        ...formData,
      });
      toast.success("Modelo de etapa criado!");
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteStageTemplate(deleteId);
      toast.success("Modelo de etapa excluído!");
      setDeleteId(null);
    }
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        checklistItems: [...prev.checklistItems, newChecklistItem.trim()],
      }));
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Modelos de Etapas
          </h1>
          <p className="text-muted-foreground">
            Cadastre etapas reutilizáveis para procedimentos
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
              Nova Etapa
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-lg"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? "Editar" : "Cadastrar"} Modelo de Etapa
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nome da Etapa</Label>
                <Input
                  placeholder="Ex: Anestesia"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva a etapa..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>
              <div>
                <Label>Duração Estimada</Label>
                <Input
                  placeholder="Ex: 30 min"
                  value={formData.defaultDuration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      defaultDuration: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Itens do Checklist</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Novo item..."
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
                {formData.checklistItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.checklistItems.map((item, idx) => (
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
              placeholder="Buscar modelos de etapa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{template.defaultDuration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ListChecks className="h-4 w-4" />
                  <span>{template.checklistItems.length} itens</span>
                </div>
              </div>
              {template.checklistItems.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.checklistItems.slice(0, 3).map((item, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                  {template.checklistItems.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.checklistItems.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este modelo de etapa? Esta ação não
              pode ser desfeita.
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
    </div>
  );
}
