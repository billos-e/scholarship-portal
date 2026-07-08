"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, KeyRound, MapPin, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { createUniversity } from "@/lib/actions/universities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function UniversityDialog({
  trigger,
}: {
  trigger?: React.ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setError(undefined);
  }

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createUniversity({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError(undefined);
      toast.success("University created.");
      setOpen(false);
      if (result.universityId) {
        router.push(`/admin/universities/${result.universityId}`);
      }
    });
  }

  const defaultTrigger = (
    <Button>
      <Plus /> New University
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={trigger ?? defaultTrigger} />
      <DialogContent className="flex max-h-[min(92vh,900px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl lg:max-w-4xl">
        <div className="relative border-b border-border/60 bg-gradient-to-br from-brand-fuchsia-light/40 via-background to-brand-orange-light/25 px-6 pb-5 pt-6">
          <div
            className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl"
            aria-hidden
          />
          <DialogHeader className="relative text-left">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <DialogTitle className="font-heading text-xl font-semibold tracking-tight">
              Add university
            </DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-relaxed">
              Partner universities used across student profiles. Location and
              website details can be added now or later.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form action={onSubmit} className="flex min-h-0 min-w-0 flex-1 flex-col">
          <input type="hidden" name="isActive" value="on" />

          <div className="space-y-6 px-6 py-5">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <KeyRound className="size-3.5" />
                Required
              </div>

              <div className="min-w-0 space-y-2">
                <Label htmlFor="name" className="flex items-center gap-1.5">
                  <Building2 className="size-3.5 text-muted-foreground" />
                  University name
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Chulalongkorn University"
                  required
                  className="h-10"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="size-3.5" />
                Optional
              </div>

              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" placeholder="Bangkok" />
                </div>
                <div className="min-w-0 space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" placeholder="Thailand" />
                </div>
                <div className="min-w-0 space-y-2 sm:col-span-2">
                  <Label htmlFor="addressLine">Address</Label>
                  <Input id="addressLine" name="addressLine" />
                </div>
                <div className="min-w-0 space-y-2 sm:col-span-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    placeholder="https://www.example.ac.th"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                <div className="min-w-0">
                  <Label htmlFor="hasSummerSemester">Has summer semester</Label>
                  <p className="text-xs text-muted-foreground">
                    Whether this university runs a summer term.
                  </p>
                </div>
                <Switch
                  id="hasSummerSemester"
                  name="hasSummerSemester"
                  defaultChecked
                />
              </div>
            </section>

            {error ? (
              <p
                className={cn(
                  "rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2",
                  "text-sm font-medium text-destructive",
                )}
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="-mx-0 -mb-0 shrink-0 flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="submit"
              disabled={pending}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {pending ? "Creating…" : "Create university"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
