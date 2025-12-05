import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Clock,
  Circle,
  FileText,
  Calendar,
  Upload,
  Save,
  X,
  SkipForward,
  Play,
  AlertTriangle,
  GripHorizontal,
  ListChecks,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
    bgColor: "bg-emerald-500",
    borderColor: "border-emerald-500",
    textColor: "text-emerald-600",
    badgeVariant: "default" as const,
    label: "Concluído",
    gradient: "from-emerald-500/20 to-emerald-500/5",
  },
  in_progress: {
    icon: Play,
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
    textColor: "text-blue-600",
    badgeVariant: "secondary" as const,
    label: "Em Andamento",
    gradient: "from-blue-500/20 to-blue-500/5",
  },
  pending: {
    icon: Clock,
    bgColor: "bg-slate-400",
    borderColor: "border-slate-300",
    textColor: "text-slate-500",
    badgeVariant: "outline" as const,
    label: "Pendente",
    gradient: "from-slate-200/50 to-slate-100/30",
  },
  skipped: {
    icon: SkipForward,
    bgColor: "bg-amber-500",
    borderColor: "border-amber-400",
    textColor: "text-amber-600",
    badgeVariant: "outline" as const,
    label: "Pulado",
    gradient: "from-amber-500/20 to-amber-500/5",
  },
};

// Width of each stage card + gap for scroll calculations
const STAGE_WIDTH = 280; // w-64 (256px) + gap-6 (24px)

export function HorizontalTimeline({
  stages,
  patientName,
  treatmentName,
  onStageUpdate,
}: HorizontalTimelineProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitialized = useRef(false);

  // Carousel state
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maxTranslate, setMaxTranslate] = useState(0);

  const [selectedStage, setSelectedStage] = useState<TreatmentStage | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "" as TreatmentStage["status"],
    notes: "",
    diagnosis: "",
    attachments: [] as string[],
    scheduledDate: "",
    completedChecklist: [] as string[],
  });
  const [attachmentToDelete, setAttachmentToDelete] = useState<{
    index: number;
    name: string;
  } | null>(null);

  // Calculate progress stats
  const progressStats = useMemo(() => {
    const completed = stages.filter((s) => s.status === "completed").length;
    const inProgress = stages.filter((s) => s.status === "in_progress").length;
    const skipped = stages.filter((s) => s.status === "skipped").length;
    const total = stages.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, inProgress, skipped, total, percentage };
  }, [stages]);

  // Find current stage index
  const currentStageIndex = useMemo(() => {
    const inProgressIdx = stages.findIndex((s) => s.status === "in_progress");
    if (inProgressIdx >= 0) return inProgressIdx;
    const pendingIdx = stages.findIndex((s) => s.status === "pending");
    if (pendingIdx >= 0) return pendingIdx;
    return stages.length - 1;
  }, [stages]);

  // Calculate max translate and update button states
  const updateCarouselLimits = useCallback(() => {
    if (!carouselRef.current || !trackRef.current) {
      return;
    }

    const containerWidth = carouselRef.current.clientWidth;
    // Calculate track width: cards + gaps between them (no gap after last card)
    const cardWidth = 256;
    const gapWidth = 24;
    // Total width = (n cards * cardWidth) + ((n-1) gaps * gapWidth)
    const calculatedTrackWidth =
      stages.length * cardWidth + (stages.length - 1) * gapWidth;

    // maxTranslate = how far we can scroll (track width - visible area)
    // This ensures we stop when the last card is fully visible
    const maxTrans = Math.max(0, calculatedTrackWidth - containerWidth);

    setMaxTranslate(maxTrans);
  }, [stages.length]);

  // Update button states based on current translateX
  const updateButtonStates = useCallback(() => {
    const canLeft = translateX < -5;
    const canRight = translateX > -maxTranslate + 5 && maxTranslate > 0;
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
  }, [translateX, maxTranslate]);

  // Smooth scroll function
  const scroll = useCallback(
    (direction: "left" | "right") => {
      setTranslateX((current) => {
        const scrollAmount = STAGE_WIDTH * 2;
        const newTranslate =
          direction === "left"
            ? Math.min(0, current + scrollAmount)
            : Math.max(-maxTranslate, current - scrollAmount);
        return newTranslate;
      });
    },
    [maxTranslate]
  );

  // Center on specific stage - only used for initial positioning
  const scrollToStageInitial = useCallback(
    (index: number, maxTrans: number, containerWidth: number) => {
      if (index < 0 || containerWidth <= 0) return;

      const targetPosition =
        index * STAGE_WIDTH - containerWidth / 2 + STAGE_WIDTH / 2;
      const clampedPosition = Math.max(0, Math.min(targetPosition, maxTrans));

      setTranslateX(-clampedPosition);
    },
    []
  );

  // Mouse/Touch drag handlers - use refs to avoid stale closures
  const dragState = useRef({ startX: 0, startTranslate: 0, maxTrans: 0 });

  const handleDragStart = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      dragState.current = {
        startX: clientX,
        startTranslate: translateX,
        maxTrans: maxTranslate,
      };
    },
    [translateX, maxTranslate]
  );

  const handleDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;

      const { startX, startTranslate, maxTrans } = dragState.current;
      const diff = clientX - startX;
      const newTranslate = Math.max(
        -maxTrans,
        Math.min(0, startTranslate + diff)
      );
      setTranslateX(newTranslate);
    },
    [isDragging]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      handleDragMove(e.clientX);
    },
    [handleDragMove]
  );

  const onMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  // Add/remove global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };
    }
  }, [isDragging, onMouseMove, onMouseUp]);

  // Initial scroll to current stage - runs ONCE
  useEffect(() => {
    if (stages.length === 0 || hasInitialized.current) return;

    const timer = setTimeout(() => {
      if (!carouselRef.current || !trackRef.current || !containerRef.current)
        return;

      // Calculate dimensions
      const containerWidth = carouselRef.current.clientWidth;
      const cardWidth = 256;
      const gapWidth = 24;
      const calculatedTrackWidth =
        stages.length * cardWidth + (stages.length - 1) * gapWidth;
      const maxTrans = Math.max(0, calculatedTrackWidth - containerWidth);

      setMaxTranslate(maxTrans);
      scrollToStageInitial(currentStageIndex, maxTrans, containerWidth);
      hasInitialized.current = true;
    }, 150);

    return () => clearTimeout(timer);
  }, [stages.length, currentStageIndex, scrollToStageInitial]);

  // Update limits on resize
  useEffect(() => {
    const handleResize = () => {
      updateCarouselLimits();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateCarouselLimits]);

  // Update button states when translate or maxTranslate changes
  useEffect(() => {
    updateButtonStates();
  }, [translateX, maxTranslate, updateButtonStates]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return format(new Date(dateStr), "dd MMM yyyy", { locale: ptBR });
  };

  const openEditDialog = (stage: TreatmentStage) => {
    setSelectedStage(stage);
    setEditForm({
      status: stage.status,
      notes: stage.notes || "",
      diagnosis: "",
      attachments: stage.attachments || [],
      scheduledDate: stage.scheduledDate || "",
      completedChecklist: stage.completedChecklist || [],
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (selectedStage && onStageUpdate) {
      onStageUpdate(selectedStage.id, {
        status: editForm.status,
        notes: editForm.notes,
        attachments: editForm.attachments,
        scheduledDate: editForm.scheduledDate || undefined,
        completedChecklist: editForm.completedChecklist,
      });
    }
    setIsEditing(false);
    setSelectedStage(null);
  };

  const toggleChecklistItem = (item: string) => {
    setEditForm((prev) => {
      const isCompleted = prev.completedChecklist.includes(item);
      return {
        ...prev,
        completedChecklist: isCompleted
          ? prev.completedChecklist.filter((i) => i !== item)
          : [...prev.completedChecklist, item],
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments = Array.from(files).map((f) => f.name);
      setEditForm((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments],
      }));
    }
  };

  const confirmDeleteAttachment = () => {
    if (attachmentToDelete !== null) {
      setEditForm((prev) => ({
        ...prev,
        attachments: prev.attachments.filter(
          (_, i) => i !== attachmentToDelete.index
        ),
      }));
      setAttachmentToDelete(null);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      {/* Header - fixed width based on parent */}
      <CardHeader className="bg-card border-b pb-4">
        <div className="flex flex-col gap-4">
          {/* Title and Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                {treatmentName}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Paciente:{" "}
                  <span className="font-medium text-foreground">
                    {patientName}
                  </span>
                </span>
              </p>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "transition-all",
                          !canScrollLeft && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Etapas anteriores</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={cn(
                          "transition-all",
                          !canScrollRight && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Próximas etapas</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>

          {/* Progress Bar and Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-muted-foreground">Concluídas:</span>
                  <span className="font-semibold">
                    {progressStats.completed}
                  </span>
                </span>
                {progressStats.inProgress > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Play className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Em andamento:</span>
                    <span className="font-semibold">
                      {progressStats.inProgress}
                    </span>
                  </span>
                )}
                {progressStats.skipped > 0 && (
                  <span className="flex items-center gap-1.5">
                    <SkipForward className="h-4 w-4 text-amber-500" />
                    <span className="text-muted-foreground">Puladas:</span>
                    <span className="font-semibold">
                      {progressStats.skipped}
                    </span>
                  </span>
                )}
              </div>
              <span className="font-bold text-lg">
                {progressStats.percentage}%
              </span>
            </div>
            <Progress value={progressStats.percentage} className="h-2" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4 px-0">
        {/* Carousel Container - ref for measuring full width */}
        <div ref={containerRef} className="relative w-full">
          {/* Left Navigation Button - Fixed position */}
          <Button
            variant="default"
            size="lg"
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 z-30",
              "h-12 w-12 rounded-full shadow-2xl border-2 border-primary/20",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "transition-all duration-300",
              canScrollLeft
                ? "hover:scale-110 opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {/* Right Navigation Button - Fixed position */}
          <Button
            variant="default"
            size="lg"
            className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 z-30",
              "h-12 w-12 rounded-full shadow-2xl border-2 border-primary/20",
              "bg-primary text-primary-foreground hover:bg-primary/90",
              "transition-all duration-300",
              canScrollRight
                ? "hover:scale-110 opacity-100"
                : "opacity-0 pointer-events-none"
            )}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Carousel Viewport - limited width to show 4 cards */}
          <div
            ref={carouselRef}
            className={cn(
              "overflow-hidden py-4 mx-auto",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
            style={{
              width: "calc(100% - 120px)",
              maxWidth: "1180px", // 4 cards visible (256*4 + 24*3 + padding)
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Drag hint */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-4 select-none">
              <GripHorizontal className="h-4 w-4" />
              <span>Arraste para navegar</span>
            </div>

            {/* Track - moves with translateX - w-max forces width based on content */}
            <div
              ref={trackRef}
              className="inline-flex gap-6 transition-transform duration-300 ease-out select-none w-max"
              style={{
                transform: `translateX(${translateX}px)`,
                transitionDuration: isDragging ? "0ms" : "300ms",
              }}
            >
              {stages.map((stage, index) => {
                const config = statusConfig[stage.status];
                const StatusIcon = config.icon;
                const isCurrent = stage.status === "in_progress";
                const isCompleted = stage.status === "completed";
                const isPending = stage.status === "pending";
                const isSkipped = stage.status === "skipped";

                return (
                  <div
                    key={stage.id}
                    className="relative flex flex-col items-center group flex-shrink-0"
                  >
                    {/* Node with enhanced styling */}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openEditDialog(stage)}
                            className={cn(
                              "relative z-10 w-14 h-14 rounded-full border-4 flex items-center justify-center transition-all duration-300 bg-card shadow-md",
                              "hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2",
                              config.borderColor,
                              isCurrent &&
                                "ring-4 ring-blue-500/40 shadow-blue-500/25 shadow-lg",
                              isCompleted && "ring-2 ring-emerald-500/30",
                              isSkipped && "ring-2 ring-amber-500/30"
                            )}
                          >
                            {/* Pulse animation for current stage */}
                            {isCurrent && (
                              <span className="absolute inset-0 rounded-full animate-ping bg-blue-500/20" />
                            )}
                            <StatusIcon
                              className={cn(
                                "h-6 w-6 relative z-10 transition-transform",
                                config.textColor,
                                isCurrent && "animate-pulse"
                              )}
                            />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="font-medium">
                          Clique para editar
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {/* Stage Card - Enhanced design */}
                    <div
                      onClick={() => openEditDialog(stage)}
                      className={cn(
                        "mt-5 w-64 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
                        "hover:shadow-lg hover:-translate-y-1 group-hover:border-primary/50",
                        "bg-gradient-to-br",
                        isCurrent &&
                          "border-blue-500 bg-gradient-to-br from-blue-500/10 to-blue-500/5 shadow-md shadow-blue-500/10",
                        isCompleted &&
                          "border-emerald-500/50 from-emerald-500/10 to-emerald-500/5",
                        isSkipped &&
                          "border-amber-500/50 from-amber-500/10 to-amber-500/5",
                        isPending &&
                          "border-slate-200 from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
                      )}
                    >
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full",
                            isCurrent &&
                              "bg-blue-500/20 text-blue-700 dark:text-blue-300",
                            isCompleted &&
                              "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                            isSkipped &&
                              "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                            isPending &&
                              "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          )}
                        >
                          {stage.orderIndex}/{stages.length}
                        </span>
                        <Badge
                          variant={config.badgeVariant}
                          className={cn(
                            "text-xs font-semibold",
                            isCompleted &&
                              "bg-emerald-500 hover:bg-emerald-600",
                            isCurrent &&
                              "bg-blue-500 hover:bg-blue-600 text-white"
                          )}
                        >
                          {config.label}
                        </Badge>
                      </div>

                      {/* Stage Name */}
                      <h4 className="font-bold text-sm mb-3 line-clamp-2 leading-snug">
                        {stage.name}
                      </h4>

                      {/* Date Info */}
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar
                            className={cn(
                              "h-3.5 w-3.5",
                              isPending
                                ? "text-muted-foreground"
                                : config.textColor
                            )}
                          />
                          <span className="text-muted-foreground">
                            Agendado:
                          </span>
                          <span className="font-medium">
                            {formatDate(stage.scheduledDate)}
                          </span>
                        </div>
                        {stage.dateCompleted && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                            <span>Concluído:</span>
                            <span className="font-medium">
                              {formatDate(stage.dateCompleted)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Checklist indicator */}
                      {stage.checklistItems &&
                        stage.checklistItems.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ListChecks className="h-3.5 w-3.5" />
                                <span className="font-medium">Checklist</span>
                              </div>
                              <Badge
                                variant={
                                  (stage.completedChecklist?.length || 0) ===
                                  stage.checklistItems.length
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-[10px] px-1.5 py-0"
                              >
                                {stage.completedChecklist?.length || 0}/
                                {stage.checklistItems.length}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              {stage.checklistItems
                                .slice(0, 3)
                                .map((item, idx) => {
                                  const isChecked =
                                    stage.completedChecklist?.includes(item);
                                  return (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1.5 text-xs"
                                    >
                                      {isChecked ? (
                                        <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                                      ) : (
                                        <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                                      )}
                                      <span
                                        className={cn(
                                          "truncate",
                                          isChecked &&
                                            "line-through text-muted-foreground"
                                        )}
                                      >
                                        {item}
                                      </span>
                                    </div>
                                  );
                                })}
                              {stage.checklistItems.length > 3 && (
                                <p className="text-[10px] text-muted-foreground pl-4">
                                  +{stage.checklistItems.length - 3} mais...
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                      {/* Notes preview */}
                      {stage.notes && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                          <p className="text-xs text-muted-foreground line-clamp-2 italic">
                            "{stage.notes}"
                          </p>
                        </div>
                      )}

                      {/* Attachments indicator */}
                      {stage.attachments && stage.attachments.length > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{stage.attachments.length} anexo(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Stage Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(false)}>
        <DialogContent
          className="max-w-lg"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Editar Etapa: {selectedStage?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedStage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Etapa {selectedStage.orderIndex} de {stages.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value: TreatmentStage["status"]) =>
                      setEditForm((prev) => ({ ...prev, status: value }))
                    }
                  >
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
                  <Input
                    type="date"
                    value={editForm.scheduledDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        scheduledDate: e.target.value,
                      }))
                    }
                    disabled={editForm.status === "completed"}
                  />
                  {editForm.status === "completed" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Etapas concluídas não podem ter a data alterada
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  placeholder="Adicione observações sobre esta etapa..."
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              {/* Checklist Section */}
              {selectedStage?.checklistItems &&
                selectedStage.checklistItems.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="flex items-center gap-2">
                        <ListChecks className="h-4 w-4" />
                        Checklist da Etapa
                      </Label>
                      <Badge
                        variant={
                          editForm.completedChecklist.length ===
                          selectedStage.checklistItems.length
                            ? "default"
                            : "secondary"
                        }
                      >
                        {editForm.completedChecklist.length}/
                        {selectedStage.checklistItems.length} concluídos
                      </Badge>
                    </div>
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg border">
                      {selectedStage.checklistItems.map((item, idx) => {
                        const isChecked =
                          editForm.completedChecklist.includes(item);
                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-background",
                              isChecked &&
                                "bg-emerald-50 dark:bg-emerald-950/30"
                            )}
                            onClick={() => toggleChecklistItem(item)}
                          >
                            <Checkbox
                              id={`checklist-${idx}`}
                              checked={isChecked}
                              onCheckedChange={() => toggleChecklistItem(item)}
                            />
                            <label
                              htmlFor={`checklist-${idx}`}
                              className={cn(
                                "flex-1 text-sm cursor-pointer select-none",
                                isChecked &&
                                  "line-through text-muted-foreground"
                              )}
                            >
                              {item}
                            </label>
                            {isChecked && (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {editForm.completedChecklist.length ===
                      selectedStage.checklistItems.length && (
                      <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Todos os itens foram concluídos!
                      </p>
                    )}
                  </div>
                )}

              <div>
                <Label>Diagnóstico</Label>
                <Textarea
                  placeholder="Diagnóstico ou achados clínicos..."
                  value={editForm.diagnosis}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      diagnosis: e.target.value,
                    }))
                  }
                  rows={2}
                />
              </div>

              <div>
                <Label>Anexos</Label>
                <div className="mt-2">
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Clique para adicionar arquivos
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {editForm.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {editForm.attachments.map((file, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="gap-1 pr-1"
                      >
                        <FileText className="h-3 w-3" />
                        {file}
                        <button
                          type="button"
                          onClick={() =>
                            setAttachmentToDelete({ index: idx, name: file })
                          }
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
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
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
      <AlertDialog
        open={!!attachmentToDelete}
        onOpenChange={() => setAttachmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Anexo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o anexo{" "}
              <strong>"{attachmentToDelete?.name}"</strong> do paciente{" "}
              <strong>{patientName}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAttachment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
