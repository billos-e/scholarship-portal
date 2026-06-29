"use client";

import Image from "next/image";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import { uploadStudentPhoto, type ActionState } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadPublicUrl } from "@/lib/upload-path";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Uploading..." : "Upload photo"}
    </Button>
  );
}

export function AdminStudentPhotoForm({
  studentId,
  photoUrl,
  name,
}: {
  studentId: string;
  photoUrl: string | null;
  name: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    uploadStudentPhoto,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Photo updated.");
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xl font-semibold text-muted-foreground">
        {photoUrl ? (
          <Image
            src={uploadPublicUrl(photoUrl)}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        )}
      </div>
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="id" value={studentId} />
        <div className="space-y-1">
          <Label htmlFor="photo">Profile photo</Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
