import React, { useState } from "react";
import { Check, X, AlertCircle, ArrowRight, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatusId = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "PAID";

const WORKFLOW_STAGES: { id: StatusId; label: string; description: string }[] = [
  { id: "SUBMITTED", label: "Submitted", description: "Request received" },
  { id: "UNDER_REVIEW", label: "Under Review", description: "Checking details" },
  { id: "APPROVED", label: "Approved", description: "Ready for payment" },
  { id: "PAID", label: "Paid", description: "Funds disbursed" },
];

export default function SegmentedChipsWorkflow() {
  const [currentStatus, setCurrentStatus] = useState<StatusId>("UNDER_REVIEW");
  const [isRejected, setIsRejected] = useState(false);
  const [targetStatus, setTargetStatus] = useState<StatusId | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentIndex = WORKFLOW_STAGES.findIndex((s) => s.id === currentStatus);

  const handleChipClick = (statusId: StatusId) => {
    if (statusId === currentStatus && !isRejected) return;
    setTargetStatus(statusId);
    setIsModalOpen(true);
  };

  const confirmMove = () => {
    if (targetStatus) {
      setCurrentStatus(targetStatus);
      setIsRejected(false);
    }
    setIsModalOpen(false);
  };

  const getVisualState = (index: number) => {
    if (isRejected) {
      if (index < currentIndex) return "completed";
      if (index === currentIndex) return "rejected";
      return "upcoming";
    }
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-muted/20 p-8 flex items-start justify-center font-sans">
      <div className="w-full max-w-4xl space-y-8">
        {/* Demo Controls */}
        <Card className="border-dashed border-2 shadow-none bg-background/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Interactive Mockup Controls</p>
              <p className="text-xs text-muted-foreground">Toggle the switch to simulate a rejected request at the current stage.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="reject-mode"
                checked={isRejected}
                onCheckedChange={setIsRejected}
              />
              <Label htmlFor="reject-mode" className="text-sm font-medium">
                Simulate Rejected State
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Main Component */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-background">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Payment Request
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <User className="size-4" />
                    <span className="font-medium text-foreground">Somchai Jaidee</span>
                    <span>&mdash;</span>
                    <span>2024 Spring Semester</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Amount Due</p>
                  <p className="text-2xl font-bold font-mono text-foreground">฿45,000</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                Workflow Stage
              </h3>
              
              <div className="flex flex-col md:flex-row gap-3">
                {WORKFLOW_STAGES.map((stage, index) => {
                  const state = getVisualState(index);
                  
                  return (
                    <button
                      key={stage.id}
                      onClick={() => handleChipClick(stage.id)}
                      className={cn(
                        "flex-1 relative group flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        state === "completed" && "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 hover:border-primary/30",
                        state === "current" && "border-primary bg-primary/5 text-primary shadow-sm scale-[1.02] z-10",
                        state === "upcoming" && "border-border/50 bg-background text-muted-foreground hover:border-border hover:bg-accent/50",
                        state === "rejected" && "border-destructive bg-destructive/10 text-destructive shadow-sm scale-[1.02] z-10"
                      )}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className={cn(
                          "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                          state === "completed" && "bg-primary/20 text-primary",
                          state === "current" && "bg-primary text-primary-foreground",
                          state === "upcoming" && "bg-muted text-muted-foreground",
                          state === "rejected" && "bg-destructive text-destructive-foreground"
                        )}>
                          {state === "completed" ? (
                            <Check className="size-3.5" />
                          ) : state === "rejected" ? (
                            <X className="size-3.5" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        
                        {(state === "completed" || state === "upcoming") && (
                          <div className={cn(
                            "opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 text-xs font-medium",
                            state === "completed" ? "text-primary/70" : "text-muted-foreground"
                          )}>
                            Move to
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className={cn(
                          "font-semibold",
                          state === "current" && "text-primary",
                          state === "rejected" && "text-destructive",
                          state === "completed" && "text-foreground",
                          state === "upcoming" && "text-foreground/70"
                        )}>
                          {stage.label}
                        </div>
                        <div className={cn(
                          "text-xs",
                          state === "current" ? "text-primary/70" : "text-muted-foreground",
                          state === "rejected" && "text-destructive/70"
                        )}>
                          {state === "rejected" ? "Request denied" : stage.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                <AlertCircle className="size-5" />
              </div>
              <DialogTitle className="text-xl">Update Workflow Stage</DialogTitle>
            </div>
            <DialogDescription className="text-base pt-2">
              Are you sure you want to move this request from{" "}
              <span className="font-semibold text-foreground">
                {WORKFLOW_STAGES.find((s) => s.id === currentStatus)?.label}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-primary">
                {WORKFLOW_STAGES.find((s) => s.id === targetStatus)?.label}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          {targetStatus && (
            <div className="bg-muted/50 rounded-lg p-4 my-4 flex items-center justify-center gap-4">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Current</p>
                <div className="font-medium text-foreground p-2 bg-background rounded border border-border shadow-sm">
                  {WORKFLOW_STAGES.find((s) => s.id === currentStatus)?.label}
                </div>
              </div>
              <ArrowRight className="size-5 text-muted-foreground" />
              <div className="text-center flex-1">
                <p className="text-xs text-primary mb-1 uppercase tracking-wider font-semibold">Target</p>
                <div className="font-medium text-primary p-2 bg-primary/10 border border-primary/20 rounded shadow-sm">
                  {WORKFLOW_STAGES.find((s) => s.id === targetStatus)?.label}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmMove} className="min-w-24">
              Confirm Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
