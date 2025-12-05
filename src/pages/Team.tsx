import { useState } from "react";
import { Plus, Search, Edit, Trash2, Mail, Shield, Stethoscope, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { users, User } from "@/data/mockData";

const roleConfig = {
  admin: { label: "Administrador", icon: Shield, color: "bg-primary/10 text-primary" },
  dentist: { label: "Dentista", icon: Stethoscope, color: "bg-accent/10 text-accent" },
  reception: { label: "Recepção", icon: UserCircle, color: "bg-secondary text-secondary-foreground" },
};

export default function Team() {
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredUsers = users.filter(
    u => u.name.toLowerCase().includes(search.toLowerCase()) ||
         u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-muted-foreground">Gestão de dentistas e colaboradores</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Membro</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input placeholder="Digite o nome completo" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" placeholder="email@dentaltrack.com" />
              </div>
              <div>
                <Label>Perfil de Acesso</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="dentist">Dentista</SelectItem>
                    <SelectItem value="reception">Recepção</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Especialidade (opcional)</Label>
                <Input placeholder="Ex: Implantodontia, Ortodontia" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar Membro</Button>
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
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => {
          const role = roleConfig[user.role];
          const RoleIcon = role.icon;

          return (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={role.color}>
                      <RoleIcon className="h-3 w-3 mr-1" />
                      {role.label}
                    </Badge>
                  </div>

                  {user.specialty && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-muted-foreground">Especialidade</p>
                      <p className="font-medium">{user.specialty}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">
              {users.filter(u => u.role === 'dentist' || u.role === 'admin').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Dentistas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-accent">
              {users.filter(u => u.role === 'reception').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Recepcionistas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-foreground">
              {users.length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total da Equipe</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
