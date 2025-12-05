// Types
export interface User {
  id: string;
  name: string;
  role: "admin" | "dentist" | "reception";
  email: string;
  avatar?: string;
  specialty?: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  birthDate: string;
  healthInsuranceId?: string;
  healthInsuranceName?: string;
  address: string;
  createdAt: string;
}

export interface ProcedureTemplate {
  id: string;
  name: string;
  baseCost: number;
  estimatedDuration: string;
  description: string;
  category: string;
}

export interface ProcedureTemplateStage {
  id: string;
  templateId: string;
  name: string;
  orderIndex: number;
  description: string;
  checklistItems: string[];
}

export interface Treatment {
  id: string;
  patientId: string;
  templateId: string;
  startDate: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  currentStageId: string;
  dentistId: string;
  totalCost: number;
  notes?: string;
}

export interface TreatmentStage {
  id: string;
  treatmentId: string;
  name: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  orderIndex: number;
  scheduledDate?: string;
  dateCompleted?: string;
  notes?: string;
  attachments?: string[];
}

export interface FinancialRecord {
  id: string;
  treatmentId: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  description: string;
  category: string;
  responsibleType: "patient" | "clinic";
  patientId?: string;
  createdBy: string;
}

// Mock Data
export const users: User[] = [
  {
    id: "1",
    name: "Dr. Carlos Silva",
    role: "admin",
    email: "carlos@dentaltrack.com",
    specialty: "Implantodontia",
  },
  {
    id: "2",
    name: "Dra. Marina Santos",
    role: "dentist",
    email: "marina@dentaltrack.com",
    specialty: "Ortodontia",
  },
  {
    id: "3",
    name: "Dr. Roberto Lima",
    role: "dentist",
    email: "roberto@dentaltrack.com",
    specialty: "Endodontia",
  },
  {
    id: "4",
    name: "Ana Paula Costa",
    role: "reception",
    email: "ana@dentaltrack.com",
  },
  {
    id: "5",
    name: "Juliana Mendes",
    role: "reception",
    email: "juliana@dentaltrack.com",
  },
];

export const patients: Patient[] = [
  {
    id: "1",
    name: "João Pedro Oliveira",
    cpf: "123.456.789-00",
    phone: "(11) 99999-1234",
    email: "joao@email.com",
    birthDate: "1985-03-15",
    healthInsuranceId: "UNIMED-12345",
    healthInsuranceName: "Unimed",
    address: "Rua das Flores, 123 - São Paulo, SP",
    createdAt: "2024-01-10",
  },
  {
    id: "2",
    name: "Maria Fernanda Silva",
    cpf: "234.567.890-11",
    phone: "(11) 98888-5678",
    email: "maria@email.com",
    birthDate: "1990-07-22",
    healthInsuranceName: "Particular",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    createdAt: "2024-02-15",
  },
  {
    id: "3",
    name: "Carlos Eduardo Souza",
    cpf: "345.678.901-22",
    phone: "(11) 97777-9012",
    email: "carlos@email.com",
    birthDate: "1978-11-08",
    healthInsuranceId: "AMIL-67890",
    healthInsuranceName: "Amil",
    address: "Rua Augusta, 500 - São Paulo, SP",
    createdAt: "2024-03-01",
  },
  {
    id: "4",
    name: "Ana Beatriz Costa",
    cpf: "456.789.012-33",
    phone: "(11) 96666-3456",
    email: "ana.b@email.com",
    birthDate: "1995-01-30",
    healthInsuranceName: "Bradesco Saúde",
    address: "Rua Oscar Freire, 200 - São Paulo, SP",
    createdAt: "2024-03-20",
  },
  {
    id: "5",
    name: "Roberto Almeida",
    cpf: "567.890.123-44",
    phone: "(11) 95555-7890",
    email: "roberto@email.com",
    birthDate: "1982-06-12",
    healthInsuranceName: "Particular",
    address: "Alameda Santos, 800 - São Paulo, SP",
    createdAt: "2024-04-05",
  },
  {
    id: "6",
    name: "Fernanda Lima",
    cpf: "678.901.234-55",
    phone: "(11) 94444-1234",
    email: "fernanda@email.com",
    birthDate: "1988-09-25",
    healthInsuranceId: "SULAMERICA-11111",
    healthInsuranceName: "SulAmérica",
    address: "Rua Haddock Lobo, 350 - São Paulo, SP",
    createdAt: "2024-04-18",
  },
];

export const procedureTemplates: ProcedureTemplate[] = [
  {
    id: "1",
    name: "Implante Dentário Unitário",
    baseCost: 3500,
    estimatedDuration: "3-6 meses",
    description: "Procedimento cirúrgico para substituição de dente perdido",
    category: "Implantodontia",
  },
  {
    id: "2",
    name: "Tratamento de Canal",
    baseCost: 800,
    estimatedDuration: "1-3 sessões",
    description: "Remoção da polpa dentária infectada",
    category: "Endodontia",
  },
  {
    id: "3",
    name: "Aparelho Ortodôntico Fixo",
    baseCost: 4000,
    estimatedDuration: "18-36 meses",
    description: "Correção do alinhamento dentário",
    category: "Ortodontia",
  },
  {
    id: "4",
    name: "Extração de Siso",
    baseCost: 450,
    estimatedDuration: "1 sessão",
    description: "Remoção cirúrgica do terceiro molar",
    category: "Cirurgia",
  },
  {
    id: "5",
    name: "Clareamento Dental",
    baseCost: 1200,
    estimatedDuration: "2-4 sessões",
    description: "Procedimento estético para branqueamento",
    category: "Estética",
  },
  {
    id: "6",
    name: "Profilaxia Completa",
    baseCost: 180,
    estimatedDuration: "1 sessão",
    description: "Limpeza profissional e aplicação de flúor",
    category: "Preventivo",
  },
  {
    id: "7",
    name: "Restauração em Resina",
    baseCost: 250,
    estimatedDuration: "1 sessão",
    description: "Restauração estética de cavidades",
    category: "Dentística",
  },
  {
    id: "8",
    name: "Prótese Total",
    baseCost: 2800,
    estimatedDuration: "4-6 semanas",
    description: "Prótese removível completa",
    category: "Prótese",
  },
];

export const procedureTemplateStages: ProcedureTemplateStage[] = [
  // Implante Dentário
  {
    id: "1",
    templateId: "1",
    name: "Consulta Inicial e Avaliação",
    orderIndex: 1,
    description: "Avaliação clínica e radiográfica",
    checklistItems: [
      "Anamnese completa",
      "Exame clínico",
      "Solicitação de exames",
    ],
  },
  {
    id: "2",
    templateId: "1",
    name: "Exames de Imagem",
    orderIndex: 2,
    description: "Tomografia e radiografias",
    checklistItems: [
      "Tomografia computadorizada",
      "Radiografia panorâmica",
      "Análise óssea",
    ],
  },
  {
    id: "3",
    templateId: "1",
    name: "Planejamento Cirúrgico",
    orderIndex: 3,
    description: "Definição do plano de tratamento",
    checklistItems: [
      "Guia cirúrgico",
      "Escolha do implante",
      "Orçamento aprovado",
    ],
  },
  {
    id: "4",
    templateId: "1",
    name: "Cirurgia de Implante",
    orderIndex: 4,
    description: "Instalação do implante",
    checklistItems: [
      "Checklist pré-operatório",
      "Anestesia",
      "Instalação",
      "Sutura",
    ],
  },
  {
    id: "5",
    templateId: "1",
    name: "Período de Osseointegração",
    orderIndex: 5,
    description: "Aguardar cicatrização (3-6 meses)",
    checklistItems: ["Acompanhamento mensal", "Raio-X de controle"],
  },
  {
    id: "6",
    templateId: "1",
    name: "Reabertura e Moldagem",
    orderIndex: 6,
    description: "Segunda fase cirúrgica",
    checklistItems: ["Reabertura", "Instalação do cicatrizador", "Moldagem"],
  },
  {
    id: "7",
    templateId: "1",
    name: "Instalação da Prótese",
    orderIndex: 7,
    description: "Colocação da coroa definitiva",
    checklistItems: [
      "Prova da prótese",
      "Ajuste oclusal",
      "Cimentação/parafusamento",
    ],
  },
  {
    id: "8",
    templateId: "1",
    name: "Alta e Manutenção",
    orderIndex: 8,
    description: "Orientações finais",
    checklistItems: ["Orientações de higiene", "Agendamento de retorno"],
  },

  // Tratamento de Canal
  {
    id: "9",
    templateId: "2",
    name: "Diagnóstico e Anestesia",
    orderIndex: 1,
    description: "Confirmação diagnóstica",
    checklistItems: ["Teste de vitalidade", "Raio-X periapical", "Anestesia"],
  },
  {
    id: "10",
    templateId: "2",
    name: "Abertura e Instrumentação",
    orderIndex: 2,
    description: "Acesso e preparo dos canais",
    checklistItems: [
      "Isolamento absoluto",
      "Abertura coronária",
      "Odontometria",
      "Instrumentação",
    ],
  },
  {
    id: "11",
    templateId: "2",
    name: "Obturação",
    orderIndex: 3,
    description: "Selamento dos canais",
    checklistItems: [
      "Secagem",
      "Obturação",
      "Raio-X final",
      "Restauração provisória",
    ],
  },
  {
    id: "12",
    templateId: "2",
    name: "Restauração Definitiva",
    orderIndex: 4,
    description: "Restauração do dente",
    checklistItems: [
      "Remoção provisório",
      "Restauração definitiva",
      "Ajuste oclusal",
    ],
  },

  // Ortodontia
  {
    id: "13",
    templateId: "3",
    name: "Documentação Ortodôntica",
    orderIndex: 1,
    description: "Exames iniciais",
    checklistItems: [
      "Fotos intra/extra orais",
      "Radiografias",
      "Modelos de estudo",
      "Cefalometria",
    ],
  },
  {
    id: "14",
    templateId: "3",
    name: "Planejamento",
    orderIndex: 2,
    description: "Elaboração do plano",
    checklistItems: [
      "Análise cefalométrica",
      "Plano de tratamento",
      "Apresentação ao paciente",
    ],
  },
  {
    id: "15",
    templateId: "3",
    name: "Instalação do Aparelho",
    orderIndex: 3,
    description: "Colagem dos brackets",
    checklistItems: ["Profilaxia", "Colagem", "Inserção do arco inicial"],
  },
  {
    id: "16",
    templateId: "3",
    name: "Manutenções Mensais",
    orderIndex: 4,
    description: "Ativações periódicas",
    checklistItems: ["Avaliação", "Troca de ligaduras", "Progressão de arcos"],
  },
  {
    id: "17",
    templateId: "3",
    name: "Remoção e Contenção",
    orderIndex: 5,
    description: "Finalização",
    checklistItems: [
      "Remoção do aparelho",
      "Instalação da contenção",
      "Documentação final",
    ],
  },
];

export const treatments: Treatment[] = [
  {
    id: "1",
    patientId: "1",
    templateId: "1",
    startDate: "2024-09-15",
    status: "in_progress",
    currentStageId: "s5",
    dentistId: "1",
    totalCost: 3800,
    notes: "Paciente com boa saúde sistêmica",
  },
  {
    id: "2",
    patientId: "2",
    templateId: "2",
    startDate: "2024-11-20",
    status: "in_progress",
    currentStageId: "s10",
    dentistId: "3",
    totalCost: 850,
  },
  {
    id: "3",
    patientId: "3",
    templateId: "3",
    startDate: "2024-06-01",
    status: "in_progress",
    currentStageId: "s16",
    dentistId: "2",
    totalCost: 4500,
  },
  {
    id: "4",
    patientId: "4",
    templateId: "4",
    startDate: "2024-12-01",
    status: "scheduled",
    currentStageId: "s1",
    dentistId: "1",
    totalCost: 500,
  },
  {
    id: "5",
    patientId: "5",
    templateId: "5",
    startDate: "2024-11-01",
    status: "completed",
    currentStageId: "s4",
    dentistId: "2",
    totalCost: 1200,
  },
  {
    id: "6",
    patientId: "6",
    templateId: "6",
    startDate: "2024-12-05",
    status: "scheduled",
    currentStageId: "s1",
    dentistId: "3",
    totalCost: 180,
  },
];

export const treatmentStages: TreatmentStage[] = [
  // Treatment 1 - Implante (João Pedro)
  {
    id: "s1",
    treatmentId: "1",
    name: "Consulta Inicial e Avaliação",
    status: "completed",
    orderIndex: 1,
    scheduledDate: "2024-09-15",
    dateCompleted: "2024-09-15",
  },
  {
    id: "s2",
    treatmentId: "1",
    name: "Exames de Imagem",
    status: "completed",
    orderIndex: 2,
    scheduledDate: "2024-09-22",
    dateCompleted: "2024-09-22",
    attachments: ["tomografia_joao.pdf"],
  },
  {
    id: "s3",
    treatmentId: "1",
    name: "Planejamento Cirúrgico",
    status: "completed",
    orderIndex: 3,
    scheduledDate: "2024-09-30",
    dateCompleted: "2024-10-02",
  },
  {
    id: "s4",
    treatmentId: "1",
    name: "Cirurgia de Implante",
    status: "completed",
    orderIndex: 4,
    scheduledDate: "2024-10-15",
    dateCompleted: "2024-10-15",
    notes: "Implante Nobel 4.3x11.5mm instalado com sucesso",
  },
  {
    id: "s5",
    treatmentId: "1",
    name: "Período de Osseointegração",
    status: "in_progress",
    orderIndex: 5,
    scheduledDate: "2024-10-16",
    notes: "Acompanhamento em andamento",
  },
  {
    id: "s6",
    treatmentId: "1",
    name: "Reabertura e Moldagem",
    status: "pending",
    orderIndex: 6,
    scheduledDate: "2025-01-15",
  },
  {
    id: "s7",
    treatmentId: "1",
    name: "Instalação da Prótese",
    status: "pending",
    orderIndex: 7,
    scheduledDate: "2025-02-01",
  },
  {
    id: "s8",
    treatmentId: "1",
    name: "Alta e Manutenção",
    status: "pending",
    orderIndex: 8,
    scheduledDate: "2025-02-15",
  },

  // Treatment 2 - Canal (Maria)
  {
    id: "s9",
    treatmentId: "2",
    name: "Diagnóstico e Anestesia",
    status: "completed",
    orderIndex: 1,
    scheduledDate: "2024-11-20",
    dateCompleted: "2024-11-20",
  },
  {
    id: "s10",
    treatmentId: "2",
    name: "Abertura e Instrumentação",
    status: "in_progress",
    orderIndex: 2,
    scheduledDate: "2024-11-27",
  },
  {
    id: "s11",
    treatmentId: "2",
    name: "Obturação",
    status: "pending",
    orderIndex: 3,
    scheduledDate: "2024-12-04",
  },
  {
    id: "s12",
    treatmentId: "2",
    name: "Restauração Definitiva",
    status: "pending",
    orderIndex: 4,
    scheduledDate: "2024-12-11",
  },

  // Treatment 3 - Ortodontia (Carlos)
  {
    id: "s13",
    treatmentId: "3",
    name: "Documentação Ortodôntica",
    status: "completed",
    orderIndex: 1,
    scheduledDate: "2024-06-01",
    dateCompleted: "2024-06-01",
  },
  {
    id: "s14",
    treatmentId: "3",
    name: "Planejamento",
    status: "completed",
    orderIndex: 2,
    scheduledDate: "2024-06-15",
    dateCompleted: "2024-06-15",
  },
  {
    id: "s15",
    treatmentId: "3",
    name: "Instalação do Aparelho",
    status: "completed",
    orderIndex: 3,
    scheduledDate: "2024-07-01",
    dateCompleted: "2024-07-01",
  },
  {
    id: "s16",
    treatmentId: "3",
    name: "Manutenções Mensais",
    status: "in_progress",
    orderIndex: 4,
    scheduledDate: "2024-08-01",
    notes: "Manutenção #5 realizada em Nov/2024",
  },
  {
    id: "s17",
    treatmentId: "3",
    name: "Remoção e Contenção",
    status: "pending",
    orderIndex: 5,
    scheduledDate: "2026-01-01",
  },
];

export const financialRecords: FinancialRecord[] = [
  {
    id: "1",
    treatmentId: "1",
    type: "income",
    amount: 1900,
    date: "2024-09-15",
    description: "Entrada - Implante",
    category: "Implantodontia",
    responsibleType: "patient",
    patientId: "1",
    createdBy: "1",
  },
  {
    id: "2",
    treatmentId: "1",
    type: "income",
    amount: 1900,
    date: "2024-10-15",
    description: "Parcela 2 - Implante",
    category: "Implantodontia",
    responsibleType: "patient",
    patientId: "1",
    createdBy: "1",
  },
  {
    id: "3",
    treatmentId: "1",
    type: "expense",
    amount: 450,
    date: "2024-10-10",
    description: "Componente Nobel",
    category: "Material",
    responsibleType: "clinic",
    createdBy: "1",
  },
  {
    id: "4",
    treatmentId: "2",
    type: "income",
    amount: 850,
    date: "2024-11-20",
    description: "Tratamento de Canal",
    category: "Endodontia",
    responsibleType: "patient",
    patientId: "2",
    createdBy: "3",
  },
  {
    id: "5",
    treatmentId: "3",
    type: "income",
    amount: 1500,
    date: "2024-06-01",
    description: "Entrada - Ortodontia",
    category: "Ortodontia",
    responsibleType: "patient",
    patientId: "3",
    createdBy: "2",
  },
  {
    id: "6",
    treatmentId: "3",
    type: "income",
    amount: 500,
    date: "2024-07-01",
    description: "Mensalidade Jul",
    category: "Ortodontia",
    responsibleType: "patient",
    patientId: "3",
    createdBy: "2",
  },
  {
    id: "7",
    treatmentId: "3",
    type: "income",
    amount: 500,
    date: "2024-08-01",
    description: "Mensalidade Ago",
    category: "Ortodontia",
    responsibleType: "patient",
    patientId: "3",
    createdBy: "2",
  },
  {
    id: "8",
    treatmentId: "3",
    type: "income",
    amount: 500,
    date: "2024-09-01",
    description: "Mensalidade Set",
    category: "Ortodontia",
    responsibleType: "patient",
    patientId: "3",
    createdBy: "2",
  },
  {
    id: "9",
    treatmentId: "3",
    type: "income",
    amount: 500,
    date: "2024-10-01",
    description: "Mensalidade Out",
    category: "Ortodontia",
    responsibleType: "patient",
    patientId: "3",
    createdBy: "2",
  },
  {
    id: "10",
    treatmentId: "3",
    type: "income",
    amount: 500,
    date: "2024-11-01",
    description: "Mensalidade Nov",
    category: "Ortodontia",
    responsibleType: "patient",
    patientId: "3",
    createdBy: "2",
  },
  {
    id: "11",
    treatmentId: "5",
    type: "income",
    amount: 1200,
    date: "2024-11-01",
    description: "Clareamento",
    category: "Estética",
    responsibleType: "patient",
    patientId: "5",
    createdBy: "1",
  },
  {
    id: "12",
    treatmentId: "6",
    type: "income",
    amount: 180,
    date: "2024-12-05",
    description: "Profilaxia",
    category: "Preventivo",
    responsibleType: "patient",
    patientId: "6",
    createdBy: "1",
  },
  {
    id: "13",
    treatmentId: "1",
    type: "expense",
    amount: 120,
    date: "2024-09-15",
    description: "Material cirúrgico",
    category: "Material",
    responsibleType: "clinic",
    createdBy: "1",
  },
  {
    id: "14",
    treatmentId: "3",
    type: "expense",
    amount: 280,
    date: "2024-07-01",
    description: "Brackets cerâmicos",
    category: "Material",
    responsibleType: "clinic",
    createdBy: "2",
  },
];

// Helper functions
export const getPatientById = (id: string) => patients.find((p) => p.id === id);
export const getTemplateById = (id: string) =>
  procedureTemplates.find((t) => t.id === id);
export const getUserById = (id: string) => users.find((u) => u.id === id);
export const getStagesByTemplateId = (templateId: string) =>
  procedureTemplateStages
    .filter((s) => s.templateId === templateId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
export const getStagesByTreatmentId = (treatmentId: string) =>
  treatmentStages
    .filter((s) => s.treatmentId === treatmentId)
    .sort((a, b) => a.orderIndex - b.orderIndex);
export const getTreatmentsByPatientId = (patientId: string) =>
  treatments.filter((t) => t.patientId === patientId);
export const getFinancialByTreatmentId = (treatmentId: string) =>
  financialRecords.filter((f) => f.treatmentId === treatmentId);

// Dashboard metrics
export const getDashboardMetrics = () => {
  const today = new Date().toISOString().split("T")[0];
  const todayTreatments = treatments.filter(
    (t) =>
      t.startDate === today ||
      treatmentStages.some(
        (s) => s.treatmentId === t.id && s.scheduledDate === today
      )
  );
  const inProgress = treatments.filter((t) => t.status === "in_progress");
  const monthIncome = financialRecords
    .filter((f) => f.type === "income" && f.date.startsWith("2024-12"))
    .reduce((sum, f) => sum + f.amount, 0);

  return {
    todayAppointments: 8,
    inProgressProcedures: inProgress.length,
    monthlyRevenue: 12580,
  };
};
