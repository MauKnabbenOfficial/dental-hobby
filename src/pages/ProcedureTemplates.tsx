import { useState } from "react";
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, Clock, DollarSign, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { procedureTemplates, procedureTemplateStages, getStagesByTemplateId, ProcedureTemplate } from "@/data/mockData";

export default function ProcedureTemplates() {
  const [search, setSearch] = useState("");
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTemplates = procedureTemplates.filter(
    t => t.name.toLowerCase().includes(search.toLowerCase()) ||
         t.category.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

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

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Modelos de Procedimentos</h1>
          <p className="text-muted-foreground">Catálogo de serviços e etapas padrão</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Modelo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Modelo de Procedimento</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Nome do Procedimento</Label>
                  <Input placeholder="Ex: Implante Dentário Unitário" />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input placeholder="Ex: Implantodontia" />
                </div>
                <div>
                  <Label>Custo Base (R$)</Label>
                  <Input type="number" placeholder="0,00" />
                </div>
                <div className="col-span-2">
                  <Label>Duração Estimada</Label>
                  <Input placeholder="Ex: 3-6 meses" />
                </div>
                <div className="col-span-2">
                  <Label>Descrição</Label>
                  <Textarea placeholder="Descreva o procedimento..." rows={3} />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Modelo</Button>
              </div>
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
              <Collapsible open={isExpanded} onOpenChange={() => setExpandedTemplate(isExpanded ? null : template.id)}>
                <CollapsibleTrigger asChild>
                  <div className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 mt-1">
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{template.name}</h3>
                            <Badge className={categoryColors[template.category] || "bg-muted"}>
                              {template.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              <span className="font-medium text-foreground">{formatCurrency(template.baseCost)}</span>
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
                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => e.stopPropagation()}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6 pt-2 border-t bg-muted/30">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Etapas do Procedimento
                    </h4>
                    <div className="space-y-3">
                      {stages.map((stage, idx) => (
                        <div key={stage.id} className="flex gap-4 p-4 bg-card rounded-lg border">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                            {stage.orderIndex}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{stage.name}</p>
                            <p className="text-sm text-muted-foreground">{stage.description}</p>
                            {stage.checklistItems.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {stage.checklistItems.map((item, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {item}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
