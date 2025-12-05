import { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useData } from "@/contexts/DataContext";
import { Patient } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function Patients() {
  const {
    patients,
    addPatient,
    updatePatient,
    deletePatient,
    treatments,
    getTreatmentsByPatientId,
    getTemplateById,
    generateId,
  } = useData();
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    birthDate: "",
    healthInsuranceId: "",
    healthInsuranceName: "",
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  // Mask functions
  const maskCpf = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const maskZipCode = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{3})\d+?$/, "$1");
  };

  const sanitizeHealthInsuranceId = (value: string) => {
    // Allow only letters and numbers
    return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.cpf.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) =>
    format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });

  const resetForm = () => {
    setFormData({
      name: "",
      cpf: "",
      phone: "",
      email: "",
      birthDate: "",
      healthInsuranceId: "",
      healthInsuranceName: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    });
    setEditingPatient(null);
  };

  const openEditDialog = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      cpf: maskCpf(patient.cpf),
      phone: maskPhone(patient.phone),
      email: patient.email,
      birthDate: patient.birthDate,
      healthInsuranceId: patient.healthInsuranceId || "",
      healthInsuranceName: patient.healthInsuranceName || "",
      street: patient.street || "",
      number: patient.number || "",
      complement: patient.complement || "",
      neighborhood: patient.neighborhood || "",
      city: patient.city || "",
      state: patient.state || "",
      zipCode: maskZipCode(patient.zipCode || ""),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Remove masks before saving
    const cleanData = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, ""),
      phone: formData.phone.replace(/\D/g, ""),
      zipCode: formData.zipCode.replace(/\D/g, ""),
    };

    if (editingPatient) {
      updatePatient(editingPatient.id, cleanData);
      toast.success("Paciente atualizado!");
    } else {
      addPatient({
        id: generateId(),
        ...cleanData,
        createdAt: new Date().toISOString().split("T")[0],
      });
      toast.success("Paciente cadastrado!");
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePatient(deleteId);
      toast.success("Paciente excluído!");
      setDeleteId(null);
    }
  };

  // Get completed treatments for a patient
  const getCompletedTreatments = (patientId: string) => {
    return getTreatmentsByPatientId(patientId).filter(
      (t) => t.status === "completed"
    );
  };

  // Get all treatments for history (including in progress and scheduled)
  const getAllTreatmentsForHistory = (patientId: string) => {
    return getTreatmentsByPatientId(patientId);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">
            Gerenciamento de pacientes da clínica
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
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-2xl"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle>
                {editingPatient ? "Editar" : "Cadastrar Novo"} Paciente
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo</Label>
                <Input
                  placeholder="Digite o nome completo"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>CPF</Label>
                <Input
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cpf: maskCpf(e.target.value),
                    }))
                  }
                  maxLength={14}
                  required
                />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: maskPhone(e.target.value),
                    }))
                  }
                  maxLength={15}
                  required
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Convênio</Label>
                <Input
                  placeholder="Nome do convênio (opcional)"
                  value={formData.healthInsuranceName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      healthInsuranceName: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Nº Carteirinha</Label>
                <Input
                  placeholder="Número da carteirinha"
                  value={formData.healthInsuranceId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      healthInsuranceId: sanitizeHealthInsuranceId(
                        e.target.value
                      ),
                    }))
                  }
                />
              </div>

              {/* Address Section */}
              <div className="col-span-2 pt-2">
                <Label className="text-base font-semibold">Endereço</Label>
              </div>
              <div>
                <Label>CEP</Label>
                <Input
                  placeholder="00000-000"
                  value={formData.zipCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      zipCode: maskZipCode(e.target.value),
                    }))
                  }
                  maxLength={9}
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  placeholder="UF"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      state: e.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  maxLength={2}
                />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input
                  placeholder="Cidade"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      city: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Bairro</Label>
                <Input
                  placeholder="Bairro"
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      neighborhood: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Rua</Label>
                <Input
                  placeholder="Rua / Avenida"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      street: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número</Label>
                  <Input
                    placeholder="Nº"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Complemento</Label>
                  <Input
                    placeholder="Apto, Sala..."
                    value={formData.complement}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        complement: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter className="col-span-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPatient ? "Salvar" : "Cadastrar"}
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
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Lista de Pacientes ({filteredPatients.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Convênio</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const patientTreatments = getTreatmentsByPatientId(patient.id);
                return (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        {patientTreatments.length > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {patientTreatments.length} tratamento(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {maskCpf(patient.cpf)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {maskPhone(patient.phone)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          patient.healthInsuranceName === "Particular" ||
                          !patient.healthInsuranceName
                            ? "outline"
                            : "default"
                        }
                      >
                        {patient.healthInsuranceName || "Particular"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(patient.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setHistoryPatient(patient)}
                          title="Histórico"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPatient(patient)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(patient)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(patient.id)}
                          title="Excluir"
                        >
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

      {/* Patient Detail Dialog */}
      <Dialog
        open={!!selectedPatient}
        onOpenChange={() => setSelectedPatient(null)}
      >
        <DialogContent
          className="max-w-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-mono">{maskCpf(selectedPatient.cpf)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p>{maskPhone(selectedPatient.phone)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p>{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Data de Nascimento
                  </p>
                  <p>{formatDate(selectedPatient.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Convênio</p>
                  <Badge
                    variant={
                      selectedPatient.healthInsuranceName === "Particular"
                        ? "outline"
                        : "default"
                    }
                  >
                    {selectedPatient.healthInsuranceName || "Particular"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p>
                  {[
                    selectedPatient.street &&
                      `${selectedPatient.street}${
                        selectedPatient.number
                          ? `, ${selectedPatient.number}`
                          : ""
                      }`,
                    selectedPatient.complement,
                    selectedPatient.neighborhood,
                    selectedPatient.city && selectedPatient.state
                      ? `${selectedPatient.city} - ${selectedPatient.state}`
                      : selectedPatient.city || selectedPatient.state,
                    selectedPatient.zipCode &&
                      maskZipCode(selectedPatient.zipCode),
                  ]
                    .filter(Boolean)
                    .join(", ") || "Não informado"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Patient History Dialog */}
      <Dialog
        open={!!historyPatient}
        onOpenChange={() => setHistoryPatient(null)}
      >
        <DialogContent
          className="max-w-2xl"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Procedimentos - {historyPatient?.name}
            </DialogTitle>
          </DialogHeader>
          {historyPatient && (
            <div className="space-y-4">
              {(() => {
                const allTreatments = getAllTreatmentsForHistory(
                  historyPatient.id
                );
                const completedTreatments = allTreatments.filter(
                  (t) => t.status === "completed"
                );

                if (allTreatments.length === 0) {
                  return (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum procedimento registrado para este paciente.</p>
                    </div>
                  );
                }

                return (
                  <>
                    {completedTreatments.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                          Procedimentos Concluídos
                        </h4>
                        <div className="space-y-3">
                          {completedTreatments.map((treatment) => {
                            const template = getTemplateById(
                              treatment.templateId
                            );
                            return (
                              <div
                                key={treatment.id}
                                className="flex items-center justify-between p-4 bg-success/5 border border-success/20 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">
                                    {template?.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Iniciado em{" "}
                                    {formatDate(treatment.startDate)}
                                  </p>
                                </div>
                                <Badge className="bg-success/10 text-success">
                                  Concluído
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {allTreatments.filter((t) => t.status !== "completed")
                      .length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                          Em Andamento / Agendados
                        </h4>
                        <div className="space-y-3">
                          {allTreatments
                            .filter((t) => t.status !== "completed")
                            .map((treatment) => {
                              const template = getTemplateById(
                                treatment.templateId
                              );
                              const statusConfig: Record<
                                string,
                                { label: string; color: string }
                              > = {
                                in_progress: {
                                  label: "Em Andamento",
                                  color: "bg-primary/10 text-primary",
                                },
                                scheduled: {
                                  label: "Agendado",
                                  color: "bg-muted text-muted-foreground",
                                },
                                cancelled: {
                                  label: "Cancelado",
                                  color: "bg-destructive/10 text-destructive",
                                },
                              };
                              const status = statusConfig[treatment.status] || {
                                label: treatment.status,
                                color: "bg-muted",
                              };

                              return (
                                <div
                                  key={treatment.id}
                                  className="flex items-center justify-between p-4 bg-muted/50 border rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {template?.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Iniciado em{" "}
                                      {formatDate(treatment.startDate)}
                                    </p>
                                  </div>
                                  <Badge className={status.color}>
                                    {status.label}
                                  </Badge>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este paciente? Esta ação não pode
              ser desfeita.
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
