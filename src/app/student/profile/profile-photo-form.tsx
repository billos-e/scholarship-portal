"use client";

import Image from "next/image";
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  type ActionState,
  uploadOwnPhoto,
} from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadPublicUrl } from "@/lib/upload-path";

function PhotoSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Uploading..." : "Upload photo"}
    </Button>
  );
}

export function ProfilePhotoForm({
  photoUrl,
  name,
}: {
  photoUrl: string | null;
  name: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    uploadOwnPhoto,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success("Profile photo updated.");
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
        <div className="space-y-1">
          <Label htmlFor="photo">Profile photo</Label>
          <Input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <p className="text-xs text-muted-foreground">JPG, PNG, or WebP. Max 10 MB.</p>
        </div>
        <PhotoSubmitButton />
      </form>
    </div>
  );
}
