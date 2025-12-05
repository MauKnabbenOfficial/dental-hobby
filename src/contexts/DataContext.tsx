import { createContext, useContext, ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  User,
  Patient,
  ProcedureTemplate,
  ProcedureTemplateStage,
  Treatment,
  TreatmentStage,
  FinancialRecord,
  users as initialUsers,
  patients as initialPatients,
  procedureTemplates as initialProcedureTemplates,
  procedureTemplateStages as initialProcedureTemplateStages,
  treatments as initialTreatments,
  treatmentStages as initialTreatmentStages,
  financialRecords as initialFinancialRecords,
} from "@/data/mockData";

// Extended FinancialRecord with new fields
export interface ExtendedFinancialRecord extends FinancialRecord {
  paymentDate?: string;
  status: "pending" | "paid" | "cancelled";
}

// Stage Template for reusable stages
export interface StageTemplate {
  id: string;
  name: string;
  description: string;
  defaultDuration: string;
  checklistItems: string[];
}

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Patients
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;

  // Procedure Templates
  procedureTemplates: ProcedureTemplate[];
  addProcedureTemplate: (template: ProcedureTemplate) => void;
  updateProcedureTemplate: (
    id: string,
    template: Partial<ProcedureTemplate>
  ) => void;
  deleteProcedureTemplate: (id: string) => void;

  // Procedure Template Stages
  procedureTemplateStages: ProcedureTemplateStage[];
  addProcedureTemplateStage: (stage: ProcedureTemplateStage) => void;
  updateProcedureTemplateStage: (
    id: string,
    stage: Partial<ProcedureTemplateStage>
  ) => void;
  deleteProcedureTemplateStage: (id: string) => void;
  swapProcedureTemplateStageOrder: (stageId1: string, stageId2: string) => void;

  // Stage Templates (new)
  stageTemplates: StageTemplate[];
  addStageTemplate: (template: StageTemplate) => void;
  updateStageTemplate: (id: string, template: Partial<StageTemplate>) => void;
  deleteStageTemplate: (id: string) => void;

  // Treatments
  treatments: Treatment[];
  addTreatment: (treatment: Treatment) => void;
  updateTreatment: (id: string, treatment: Partial<Treatment>) => void;
  deleteTreatment: (id: string) => void;

  // Treatment Stages
  treatmentStages: TreatmentStage[];
  addTreatmentStage: (stage: TreatmentStage) => void;
  updateTreatmentStage: (id: string, stage: Partial<TreatmentStage>) => void;
  deleteTreatmentStage: (id: string) => void;

  // Financial Records
  financialRecords: ExtendedFinancialRecord[];
  addFinancialRecord: (record: ExtendedFinancialRecord) => void;
  updateFinancialRecord: (
    id: string,
    record: Partial<ExtendedFinancialRecord>
  ) => void;
  deleteFinancialRecord: (id: string) => void;

  // Helpers
  getPatientById: (id: string) => Patient | undefined;
  getTemplateById: (id: string) => ProcedureTemplate | undefined;
  getUserById: (id: string) => User | undefined;
  getStagesByTemplateId: (templateId: string) => ProcedureTemplateStage[];
  getStagesByTreatmentId: (treatmentId: string) => TreatmentStage[];
  getTreatmentsByPatientId: (patientId: string) => Treatment[];
  getFinancialByTreatmentId: (treatmentId: string) => ExtendedFinancialRecord[];
  generateId: () => string;

  // Reset data to initial mock values
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Initial stage templates
const initialStageTemplates: StageTemplate[] = [
  {
    id: "st1",
    name: "Anestesia",
    description: "Aplicação de anestesia local",
    defaultDuration: "15 min",
    checklistItems: [
      "Verificar alergias",
      "Preparar material",
      "Aplicar anestésico",
    ],
  },
  {
    id: "st2",
    name: "Consulta Inicial",
    description: "Primeira avaliação do paciente",
    defaultDuration: "30 min",
    checklistItems: ["Anamnese", "Exame clínico", "Radiografias iniciais"],
  },
  {
    id: "st3",
    name: "Cirurgia",
    description: "Procedimento cirúrgico",
    defaultDuration: "1-2h",
    checklistItems: [
      "Checklist pré-operatório",
      "Equipamentos",
      "Pós-operatório",
    ],
  },
  {
    id: "st4",
    name: "Retorno",
    description: "Consulta de acompanhamento",
    defaultDuration: "20 min",
    checklistItems: ["Avaliação cicatrização", "Orientações"],
  },
  {
    id: "st5",
    name: "Moldagem",
    description: "Tomada de moldes",
    defaultDuration: "30 min",
    checklistItems: ["Preparar material", "Moldagem", "Enviar laboratório"],
  },
  {
    id: "st6",
    name: "Raio-X",
    description: "Exames radiográficos",
    defaultDuration: "15 min",
    checklistItems: ["Posicionamento", "Tomada radiográfica", "Análise"],
  },
];

// Convert initial financial records to extended format
const initialExtendedFinancialRecords: ExtendedFinancialRecord[] =
  initialFinancialRecords.map((r) => ({
    ...r,
    status: "paid" as const,
    paymentDate: r.date,
  }));

export function DataProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>(
    "dentaltrack_users",
    initialUsers
  );
  const [patients, setPatients] = useLocalStorage<Patient[]>(
    "dentaltrack_patients",
    initialPatients
  );
  const [procedureTemplates, setProcedureTemplates] = useLocalStorage<
    ProcedureTemplate[]
  >("dentaltrack_procedureTemplates", initialProcedureTemplates);
  const [procedureTemplateStages, setProcedureTemplateStages] = useLocalStorage<
    ProcedureTemplateStage[]
  >("dentaltrack_procedureTemplateStages", initialProcedureTemplateStages);
  const [stageTemplates, setStageTemplates] = useLocalStorage<StageTemplate[]>(
    "dentaltrack_stageTemplates",
    initialStageTemplates
  );
  const [treatments, setTreatments] = useLocalStorage<Treatment[]>(
    "dentaltrack_treatments",
    initialTreatments
  );
  const [treatmentStages, setTreatmentStages] = useLocalStorage<
    TreatmentStage[]
  >("dentaltrack_treatmentStages", initialTreatmentStages);
  const [financialRecords, setFinancialRecords] = useLocalStorage<
    ExtendedFinancialRecord[]
  >("dentaltrack_financialRecords", initialExtendedFinancialRecords);

  const generateId = () =>
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Users CRUD
  const addUser = (user: User) => setUsers((prev) => [...prev, user]);
  const updateUser = (id: string, data: Partial<User>) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
  const deleteUser = (id: string) =>
    setUsers((prev) => prev.filter((u) => u.id !== id));

  // Patients CRUD
  const addPatient = (patient: Patient) =>
    setPatients((prev) => [...prev, patient]);
  const updatePatient = (id: string, data: Partial<Patient>) =>
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );
  const deletePatient = (id: string) =>
    setPatients((prev) => prev.filter((p) => p.id !== id));

  // Procedure Templates CRUD
  const addProcedureTemplate = (template: ProcedureTemplate) =>
    setProcedureTemplates((prev) => [...prev, template]);
  const updateProcedureTemplate = (
    id: string,
    data: Partial<ProcedureTemplate>
  ) =>
    setProcedureTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  const deleteProcedureTemplate = (id: string) => {
    setProcedureTemplates((prev) => prev.filter((t) => t.id !== id));
    setProcedureTemplateStages((prev) =>
      prev.filter((s) => s.templateId !== id)
    );
  };

  // Procedure Template Stages CRUD
  const addProcedureTemplateStage = (stage: ProcedureTemplateStage) =>
    setProcedureTemplateStages((prev) => [...prev, stage]);
  const updateProcedureTemplateStage = (
    id: string,
    data: Partial<ProcedureTemplateStage>
  ) =>
    setProcedureTemplateStages((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    );
  const deleteProcedureTemplateStage = (id: string) =>
    setProcedureTemplateStages((prev) => prev.filter((s) => s.id !== id));
  const swapProcedureTemplateStageOrder = (
    stageId1: string,
    stageId2: string
  ) => {
    setProcedureTemplateStages((prev) => {
      const stage1 = prev.find((s) => s.id === stageId1);
      const stage2 = prev.find((s) => s.id === stageId2);
      if (!stage1 || !stage2) return prev;

      const order1 = stage1.orderIndex;
      const order2 = stage2.orderIndex;

      return prev.map((s) => {
        if (s.id === stageId1) return { ...s, orderIndex: order2 };
        if (s.id === stageId2) return { ...s, orderIndex: order1 };
        return s;
      });
    });
  };

  // Stage Templates CRUD
  const addStageTemplate = (template: StageTemplate) =>
    setStageTemplates((prev) => [...prev, template]);
  const updateStageTemplate = (id: string, data: Partial<StageTemplate>) =>
    setStageTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  const deleteStageTemplate = (id: string) =>
    setStageTemplates((prev) => prev.filter((t) => t.id !== id));

  // Treatments CRUD
  const addTreatment = (treatment: Treatment) =>
    setTreatments((prev) => [...prev, treatment]);
  const updateTreatment = (id: string, data: Partial<Treatment>) =>
    setTreatments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
  const deleteTreatment = (id: string) => {
    setTreatments((prev) => prev.filter((t) => t.id !== id));
    setTreatmentStages((prev) => prev.filter((s) => s.treatmentId !== id));
  };

  // Treatment Stages CRUD
  const addTreatmentStage = (stage: TreatmentStage) =>
    setTreatmentStages((prev) => [...prev, stage]);
  const updateTreatmentStage = (id: string, data: Partial<TreatmentStage>) => {
    setTreatmentStages((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...data };
          // Auto-fill completion date when status changes to completed
          if (data.status === "completed" && !updated.dateCompleted) {
            updated.dateCompleted = new Date().toISOString().split("T")[0];
          }
          return updated;
        }
        return s;
      })
    );
  };
  const deleteTreatmentStage = (id: string) =>
    setTreatmentStages((prev) => prev.filter((s) => s.id !== id));

  // Financial Records CRUD
  const addFinancialRecord = (record: ExtendedFinancialRecord) =>
    setFinancialRecords((prev) => [...prev, record]);
  const updateFinancialRecord = (
    id: string,
    data: Partial<ExtendedFinancialRecord>
  ) =>
    setFinancialRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...data } : r))
    );
  const deleteFinancialRecord = (id: string) =>
    setFinancialRecords((prev) => prev.filter((r) => r.id !== id));

  // Helper functions
  const getPatientById = (id: string) => patients.find((p) => p.id === id);
  const getTemplateById = (id: string) =>
    procedureTemplates.find((t) => t.id === id);
  const getUserById = (id: string) => users.find((u) => u.id === id);
  const getStagesByTemplateId = (templateId: string) =>
    procedureTemplateStages
      .filter((s) => s.templateId === templateId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  const getStagesByTreatmentId = (treatmentId: string) =>
    treatmentStages
      .filter((s) => s.treatmentId === treatmentId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  const getTreatmentsByPatientId = (patientId: string) =>
    treatments.filter((t) => t.patientId === patientId);
  const getFinancialByTreatmentId = (treatmentId: string) =>
    financialRecords.filter((f) => f.treatmentId === treatmentId);

  // Reset all data to initial mock values
  const resetAllData = () => {
    setUsers(initialUsers);
    setPatients(initialPatients);
    setProcedureTemplates(initialProcedureTemplates);
    setProcedureTemplateStages(initialProcedureTemplateStages);
    setStageTemplates(initialStageTemplates);
    setTreatments(initialTreatments);
    setTreatmentStages(initialTreatmentStages);
    setFinancialRecords(initialExtendedFinancialRecords);
  };

  return (
    <DataContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        deleteUser,
        patients,
        addPatient,
        updatePatient,
        deletePatient,
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
        addStageTemplate,
        updateStageTemplate,
        deleteStageTemplate,
        treatments,
        addTreatment,
        updateTreatment,
        deleteTreatment,
        treatmentStages,
        addTreatmentStage,
        updateTreatmentStage,
        deleteTreatmentStage,
        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,
        getPatientById,
        getTemplateById,
        getUserById,
        getStagesByTemplateId,
        getStagesByTreatmentId,
        getTreatmentsByPatientId,
        getFinancialByTreatmentId,
        generateId,
        resetAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
