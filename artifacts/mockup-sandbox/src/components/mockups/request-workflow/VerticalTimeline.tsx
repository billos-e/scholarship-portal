import React, { useState } from "react";
import { 
  CheckCircle2, 
  CircleDashed, 
  Circle, 
  XCircle, 
  ArrowRight,
  User,
  Calendar,
  Clock,
  Banknote,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StepStatus = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PAID";
type GlobalState = "ACTIVE" | "REJECTED";

const STEPS: { id: StepStatus; label: string; icon: React.ElementType }[] = [
  { id: "SUBMITTED", label: "Submitted", icon: FileText },
  { id: "UNDER_REVIEW", label: "Under Review", icon: Clock },
  { id: "APPROVED", label: "Approved", icon: CheckCircle2 },
  { id: "PAID", label: "Paid", icon: Banknote },
];

export default function VerticalTimeline() {
  const [currentStep, setCurrentStep] = useState<StepStatus>("UNDER_REVIEW");
  const [globalState, setGlobalState] = useState<GlobalState>("ACTIVE");

  const [confirmingStep, setConfirmingStep] = useState<StepStatus | null>(null);

  const handleStepClick = (stepId: StepStatus) => {
    if (globalState === "REJECTED") return;
    if (stepId === currentStep) return;
    setConfirmingStep(confirmingStep === stepId ? null : stepId);
  };

  const handleConfirm = (stepId: StepStatus) => {
    setCurrentStep(stepId);
    setConfirmingStep(null);
  };

  const handleCancel = () => {
    setConfirmingStep(null);
  };

  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-8 font-sans">
      <div className="w-full max-w-sm space-y-6">
        
        {/* Demo Controls */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="rejected-mode" className="text-sm font-semibold text-slate-900">Rejected State</Label>
            <p className="text-xs text-slate-500">Toggle workflow rejection</p>
          </div>
          <Switch 
            id="rejected-mode" 
            checked={globalState === "REJECTED"}
            onCheckedChange={(c) => {
              setGlobalState(c ? "REJECTED" : "ACTIVE");
              setConfirmingStep(null);
            }}
          />
        </div>

        {/* Workflow Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">Payment Request</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">REQ-2024-089</p>
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase",
                globalState === "REJECTED" 
                  ? "bg-red-100 text-red-700" 
                  : "bg-blue-100 text-blue-700"
              )}>
                {globalState === "REJECTED" ? "Rejected" : currentStep.replace("_", " ")}
              </div>
            </div>

            <div className="space-y-2 mt-4 bg-white p-3 rounded-lg border border-slate-100">
              <div className="flex items-center text-sm">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <span className="font-medium text-slate-700">Somchai Jaidee</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <span className="text-slate-600">2024 Spring Semester</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Status Pipeline</h3>
            
            <div className="relative">
              {/* Vertical line connector */}
              <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100 -ml-px z-0" />
              
              {STEPS.map((step, index) => {
                const isCompleted = globalState !== "REJECTED" && index < currentIndex;
                const isCurrent = globalState !== "REJECTED" && index === currentIndex;
                const isUpcoming = globalState !== "REJECTED" && index > currentIndex;
                const isRejectedCurrent = globalState === "REJECTED" && index === currentIndex;
                const isRejectedPast = globalState === "REJECTED" && index < currentIndex;
                const isRejectedFuture = globalState === "REJECTED" && index > currentIndex;

                const isConfirming = confirmingStep === step.id;

                let stateColorClass = "";
                let iconBgClass = "";
                let textColorClass = "";

                if (isCompleted || isRejectedPast) {
                  stateColorClass = "text-emerald-500";
                  iconBgClass = "bg-emerald-500 text-white border-emerald-500";
                  textColorClass = "text-slate-900";
                } else if (isCurrent) {
                  stateColorClass = "text-blue-600";
                  iconBgClass = "bg-blue-50 text-blue-600 border-blue-600 ring-4 ring-blue-50";
                  textColorClass = "text-blue-900 font-semibold";
                } else if (isRejectedCurrent) {
                  stateColorClass = "text-red-600";
                  iconBgClass = "bg-red-50 text-red-600 border-red-600 ring-4 ring-red-50";
                  textColorClass = "text-red-900 font-semibold";
                } else {
                  stateColorClass = "text-slate-300";
                  iconBgClass = "bg-white text-slate-300 border-slate-200";
                  textColorClass = "text-slate-500";
                }

                const StepIcon = step.icon;

                return (
                  <div key={step.id} className="relative z-10 flex flex-col mb-6 last:mb-0">
                    {/* Step row */}
                    <button
                      type="button"
                      disabled={globalState === "REJECTED" || isCurrent}
                      onClick={() => handleStepClick(step.id)}
                      className={cn(
                        "flex items-start text-left group w-full outline-none",
                        (globalState === "REJECTED" || isCurrent) ? "cursor-default" : "cursor-pointer"
                      )}
                    >
                      <div className="flex-shrink-0 relative">
                        {/* Completed line overlap */}
                        {(isCompleted || isRejectedPast || (index === currentIndex && globalState === "REJECTED")) && index !== 0 && (
                          <div className={cn(
                            "absolute top-[-24px] bottom-1/2 left-[15px] w-0.5",
                            (isCompleted || isRejectedPast) ? "bg-emerald-500" : "bg-slate-100"
                          )} />
                        )}
                        
                        <div className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ease-out z-10 relative",
                          iconBgClass,
                          !(globalState === "REJECTED" || isCurrent) && "group-hover:border-blue-400 group-hover:text-blue-500",
                          isConfirming && "ring-4 ring-blue-100 border-blue-600 text-blue-600"
                        )}>
                          {isCompleted || isRejectedPast ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : isRejectedCurrent ? (
                            <XCircle className="w-4 h-4" />
                          ) : isCurrent ? (
                            <CircleDashed className="w-4 h-4 animate-[spin_4s_linear_infinite]" />
                          ) : (
                            <StepIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4 flex-1 pt-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className={cn("text-sm transition-colors", textColorClass, isConfirming && "text-blue-900 font-semibold")}>
                            {step.label}
                          </span>
                          
                          {(isCompleted || isRejectedPast) && (
                            <span className="text-[10px] text-slate-400 font-medium">10:42 AM</span>
                          )}
                          {(isCurrent || isRejectedCurrent) && (
                            <span className={cn(
                              "text-[10px] font-bold uppercase",
                              isCurrent ? "text-blue-600" : "text-red-600"
                            )}>
                              Active
                            </span>
                          )}
                        </div>
                        
                        {/* Subtle notes based on state */}
                        <div className="mt-0.5 text-xs text-slate-500">
                          {isCompleted && "Completed successfully."}
                          {isRejectedPast && "Completed before rejection."}
                          {isCurrent && "Awaiting action..."}
                          {isRejectedCurrent && "Request was rejected at this stage."}
                          {isUpcoming && "Pending"}
                          {isRejectedFuture && "Cancelled"}
                        </div>
                      </div>
                    </button>

                    {/* Inline Confirmation Area */}
                    {isConfirming && (
                      <div className="ml-12 mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="flex items-start gap-2 text-blue-900 mb-3">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                          <p className="text-sm font-medium leading-tight">
                            Move request to <span className="font-bold">{step.label}</span>?
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs font-semibold px-3"
                            onClick={() => handleConfirm(step.id)}
                          >
                            Confirm Move
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-xs font-medium border-slate-200 hover:bg-slate-100 text-slate-600 px-3"
                            onClick={handleCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
