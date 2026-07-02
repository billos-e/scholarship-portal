"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { ArrowLeft, BadgeCheck, Sun } from "lucide-react";
import { toast } from "sonner";

import { ProfileInfoCard } from "@/components/admin/profile-info-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  updateUniversity,
  type ActionState,
} from "@/lib/actions/universities";
import { getInitials } from "@/lib/initials";
import { uploadPublicUrl } from "@/lib/upload-path";
import { cn } from "@/lib/utils";
import { UniversityImageForm } from "../university-actions";

export type UniversityEditPageData = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  addressLine: string | null;
  websiteUrl: string | null;
  imageUrl: string | null;
  hasSummerSemester: boolean;
  isActive: boolean;
  notes: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-accent text-accent-foreground hover:bg-accent/90"
    >
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

export function UniversityEditPageForm({
  university,
  profileHref,
}: {
  university: UniversityEditPageData;
  profileHref: string;
}) {
  const initials = getInitials(university.name);
  const hasImage = Boolean(university.imageUrl?.trim());

  const [state, formAction] = useActionState<ActionState, FormData>(
    updateUniversity,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("University updated.");
  }, [state.success]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-border/80 bg-card px-6 py-6 shadow-sm sm:px-8 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className={cn(
                "relative size-24 shrink-0 overflow-hidden rounded-2xl sm:size-28",
                !hasImage &&
                  "flex items-center justify-center bg-primary text-3xl font-bold text-primary-foreground",
              )}
            >
              {hasImage ? (
                <Image
                  src={uploadPublicUrl(university.imageUrl!)}
                  alt={`${university.name} logo`}
                  fill
                  sizes="(max-width: 640px) 96px, 112px"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                initials
              )}
            </div>

            <UniversityImageForm
              universityId={university.id}
              imageUrl={university.imageUrl}
              name={university.name}
              showPreview={false}
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
            <Button
              size="sm"
              variant="outline"
              render={<Link href={profileHref} />}
            >
              <ArrowLeft className="size-3.5" />
              Back to profile
            </Button>
          </div>
        </div>
      </section>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="id" value={university.id} />

        <ProfileInfoCard title="University details">
          <div className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Basic information
              </p>
              <div className="space-y-2">
                <Label htmlFor="name">University name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={university.name}
                  placeholder="Chulalongkorn University"
                  required
                />
              </div>
            </div>

            <div className="space-y-5 border-t border-border/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Location
              </p>
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="addressLine">Street address</Label>
                  <Input
                    id="addressLine"
                    name="addressLine"
                    defaultValue={university.addressLine ?? ""}
                    placeholder="254 Phayathai Road, Pathumwan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    defaultValue={university.city ?? ""}
                    placeholder="Bangkok"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    defaultValue={university.country ?? ""}
                    placeholder="Thailand"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-5 border-t border-border/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Online presence
              </p>
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  defaultValue={university.websiteUrl ?? ""}
                  placeholder="https://www.example.ac.th"
                />
                <p className="text-xs text-muted-foreground">
                  Shown on the university profile and used for quick reference.
                </p>
              </div>
            </div>

            <div className="space-y-5 border-t border-border/50 pt-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Internal notes
              </p>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  defaultValue={university.notes ?? ""}
                  rows={4}
                  placeholder="Partnership details, contacts, or admin reminders."
                />
              </div>
            </div>
          </div>
        </ProfileInfoCard>

        <ProfileInfoCard title="Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-accent">
                    <Sun className="size-[18px]" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <Label
                      htmlFor="hasSummerSemester"
                      className="font-heading text-sm font-semibold text-foreground"
                    >
                      Summer semester
                    </Label>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Allow students to submit requests for summer terms at
                      this university.
                    </p>
                  </div>
                </div>
                <Switch
                  id="hasSummerSemester"
                  name="hasSummerSemester"
                  defaultChecked={university.hasSummerSemester}
                  className="mt-0.5"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-muted/10 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success-light text-success">
                    <BadgeCheck className="size-[18px]" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <Label
                      htmlFor="isActive"
                      className="font-heading text-sm font-semibold text-foreground"
                    >
                      Active partner
                    </Label>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Inactive universities are hidden from new student
                      assignments and selections.
                    </p>
                  </div>
                </div>
                <Switch
                  id="isActive"
                  name="isActive"
                  defaultChecked={university.isActive}
                  className="mt-0.5"
                />
              </div>
            </div>
          </div>
        </ProfileInfoCard>

        {state.error ? (
          <p className="text-sm font-medium text-destructive">{state.error}</p>
        ) : null}

        <div className="flex justify-end">
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
