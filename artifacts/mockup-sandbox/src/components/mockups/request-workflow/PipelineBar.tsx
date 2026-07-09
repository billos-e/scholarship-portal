import React, { useState } from 'react';
import { Check, X, FileText, Search, ThumbsUp, Wallet, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const STAGES = [
  { id: 'SUBMITTED', label: 'Submitted', icon: FileText },
  { id: 'UNDER_REVIEW', label: 'Under Review', icon: Search },
  { id: 'APPROVED', label: 'Approved', icon: ThumbsUp },
  { id: 'PAID', label: 'Paid', icon: Wallet },
] as const;

type StageId = typeof STAGES[number]['id'];

function PipelineStepper({
  currentStage,
  isRejected,
  onChangeStage,
}: {
  currentStage: StageId;
  isRejected: boolean;
  onChangeStage: (stage: StageId) => void;
}) {
  const currentIndex = STAGES.findIndex((s) => s.id === currentStage);
  const [openPopover, setOpenPopover] = useState<StageId | null>(null);

  const handleConfirm = (stage: StageId) => {
    onChangeStage(stage);
    setOpenPopover(null);
  };

  return (
    <div className="relative flex w-full items-center rounded-lg bg-muted/40 p-1 shadow-sm border border-border/50">
      {STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isCompleted = index < currentIndex && !isRejected;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;
        
        let stateClass = "text-muted-foreground hover:bg-muted hover:text-foreground";
        let iconClass = "text-muted-foreground/70";
        
        if (isRejected) {
          if (isCurrent) {
            stateClass = "bg-destructive text-destructive-foreground shadow-sm ring-1 ring-destructive/20";
            iconClass = "text-destructive-foreground";
          } else if (index < currentIndex) {
            stateClass = "bg-muted text-muted-foreground";
            iconClass = "text-muted-foreground/70";
          } else {
            stateClass = "text-muted-foreground/40 opacity-50 cursor-not-allowed";
            iconClass = "text-muted-foreground/30";
          }
        } else {
          if (isCurrent) {
            stateClass = "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20";
            iconClass = "text-primary-foreground";
          } else if (isCompleted) {
            stateClass = "bg-primary/10 text-primary hover:bg-primary/20";
            iconClass = "text-primary";
          }
        }

        return (
          <React.Fragment key={stage.id}>
            <Popover
              open={openPopover === stage.id}
              onOpenChange={(open) => setOpenPopover(open ? stage.id : null)}
            >
              <PopoverTrigger asChild>
                <button
                  disabled={isRejected && index > currentIndex}
                  className={cn(
                    "group relative flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    stateClass
                  )}
                >
                  <Icon className={cn("size-4 transition-colors", iconClass)} />
                  <span className="truncate">{stage.label}</span>
                  
                  {isCompleted && !isRejected && (
                    <div className="absolute right-2 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3" />
                    </div>
                  )}
                  {isCurrent && isRejected && (
                    <div className="absolute right-2 flex size-4 items-center justify-center rounded-full bg-destructive-foreground text-destructive">
                      <X className="size-3" />
                    </div>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0" align="center" sideOffset={12}>
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Move to {stage.label}?</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        This will update the request status and notify relevant parties.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpenPopover(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => handleConfirm(stage.id)}>
                      Confirm Move
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {index < STAGES.length - 1 && (
              <div className="flex shrink-0 items-center justify-center px-1">
                <ArrowRight className="size-4 text-muted-foreground/30" />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function PipelineBarMockup() {
  const [currentStage, setCurrentStage] = useState<StageId>('UNDER_REVIEW');
  const [isRejected, setIsRejected] = useState(false);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans flex items-center justify-center">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm sm:flex-row">
          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-sm font-semibold tracking-tight">Interactive Controls</h2>
            <p className="text-xs text-muted-foreground">Toggle the state to preview how the pipeline reacts</p>
          </div>
          <div className="flex items-center space-x-3 bg-muted/50 px-4 py-2 rounded-lg">
            <Label htmlFor="rejected-mode" className="text-sm font-medium cursor-pointer">
              Mark as Rejected
            </Label>
            <Switch
              id="rejected-mode"
              checked={isRejected}
              onCheckedChange={setIsRejected}
            />
          </div>
        </div>

        <Card className="border-border/50 shadow-md">
          <CardHeader className="flex flex-row items-start justify-between pb-6 border-b border-border/40 bg-muted/10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold tracking-tight">Somchai Jaidee</CardTitle>
                <Badge variant={isRejected ? "destructive" : "secondary"} className="font-medium">
                  {isRejected ? "Rejected" : "Active"}
                </Badge>
              </div>
              <CardDescription className="text-sm font-medium text-muted-foreground">
                Spring 2024 Tuition Payment Request • STU-88201
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Amount Due</div>
              <div className="text-2xl font-bold tracking-tight text-foreground font-mono">฿ 45,000</div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Workflow Status</h3>
                <span className="text-xs text-muted-foreground">Click any stage to transition</span>
              </div>
              
              <PipelineStepper 
                currentStage={currentStage} 
                isRejected={isRejected} 
                onChangeStage={(stage) => {
                  setCurrentStage(stage);
                  if (isRejected) setIsRejected(false);
                }} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" />
                  Request Details
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Submitted By</span>
                    <span className="font-medium text-foreground">Somchai Jaidee</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Date Submitted</span>
                    <span className="font-medium text-foreground">Oct 12, 2024</span>
                  </div>
                  <div className="flex justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">University</span>
                    <span className="font-medium text-foreground">Chulalongkorn University</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-muted-foreground">Supporting Docs</span>
                    <span className="font-medium text-primary cursor-pointer hover:underline">2 files attached</span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted/30 border border-border/50 p-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground">Recent Activity</h4>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_2px_rgba(0,0,0,0)]">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-even:pr-3 md:group-odd:pl-3">
                      <div className="text-xs text-muted-foreground mb-0.5">Today, 10:42 AM</div>
                      <div className="text-sm font-medium text-foreground">Moved to Under Review</div>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border border-border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_2px_rgba(0,0,0,0)]">
                    </div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] pl-3 md:pl-0 md:group-even:pr-3 md:group-odd:pl-3">
                      <div className="text-xs text-muted-foreground mb-0.5">Oct 12, 2:15 PM</div>
                      <div className="text-sm font-medium text-foreground">Request Submitted</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
