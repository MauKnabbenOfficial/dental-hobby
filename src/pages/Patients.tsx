import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { patients, Patient, getTreatmentsByPatientId } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredPatients = patients.filter(
    p => p.name.toLowerCase().includes(search.toLowerCase()) ||
         p.cpf.includes(search) ||
         p.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) => format(new Date(dateStr), "dd/MM/yyyy", { locale: ptBR });

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Gerenciamento de pacientes da clínica</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
            </DialogHeader>
            <form className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo</Label>
                <Input placeholder="Digite o nome completo" />
              </div>
              <div>
                <Label>CPF</Label>
                <Input placeholder="000.000.000-00" />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <Input type="date" />
              </div>
              <div>
                <Label>Telefone</Label>
                <Input placeholder="(00) 00000-0000" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" placeholder="email@exemplo.com" />
              </div>
              <div>
                <Label>Convênio</Label>
                <Input placeholder="Nome do convênio (opcional)" />
              </div>
              <div>
                <Label>Nº Carteirinha</Label>
                <Input placeholder="Número da carteirinha" />
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input placeholder="Endereço completo" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Paciente</Button>
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
          <CardTitle className="text-lg">Lista de Pacientes ({filteredPatients.length})</CardTitle>
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
                const treatments = getTreatmentsByPatientId(patient.id);
                return (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        {treatments.length > 0 && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {treatments.length} tratamento(s)
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{patient.cpf}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {patient.phone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {patient.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.healthInsuranceName === "Particular" ? "outline" : "default"}>
                        {patient.healthInsuranceName || "Particular"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(patient.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(patient)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
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
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
        <DialogContent className="max-w-lg">
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
                  <p className="font-mono">{selectedPatient.cpf}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p>{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p>{selectedPatient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p>{formatDate(selectedPatient.birthDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Convênio</p>
                  <Badge variant={selectedPatient.healthInsuranceName === "Particular" ? "outline" : "default"}>
                    {selectedPatient.healthInsuranceName || "Particular"}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p>{selectedPatient.address}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
