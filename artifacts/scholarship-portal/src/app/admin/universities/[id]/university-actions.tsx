"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  deactivateUniversity,
  uploadUniversityImage,
  type ActionState,
} from "@/lib/actions/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadPublicUrl } from "@/lib/upload-path";

function UploadButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? "Uploading..." : "Upload image"}
    </Button>
  );
}

export function UniversityImageForm({
  universityId,
  imageUrl,
  name,
  showPreview = true,
  onImageUploaded,
}: {
  universityId: string;
  imageUrl: string | null;
  name: string;
  showPreview?: boolean;
  onImageUploaded?: (url: string) => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    uploadUniversityImage,
    {},
  );

  const pendingFileUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (state.success) {
      toast.success("University image updated.");
      if (pendingFileUrlRef.current && onImageUploaded) {
        onImageUploaded(pendingFileUrlRef.current);
      }
      pendingFileUrlRef.current = null;
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const prev = pendingFileUrlRef.current;
      if (prev) URL.revokeObjectURL(prev);
      pendingFileUrlRef.current = URL.createObjectURL(file);
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      {showPreview ? (
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted text-sm font-medium text-muted-foreground">
          {imageUrl ? (
            <Image
              src={uploadPublicUrl(imageUrl)}
              alt={name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            name.slice(0, 2).toUpperCase()
          )}
        </div>
      ) : null}
      <form action={formAction} className="space-y-2">
        <input type="hidden" name="id" value={universityId} />
        <div className="space-y-1">
          <Label htmlFor="image">University image</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
          />
        </div>
        <UploadButton />
      </form>
    </div>
  );
}

export function DeactivateUniversityButton({
  universityId,
  isActive,
  onSuccess,
}: {
  universityId: string;
  isActive: boolean;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  if (!isActive) return null;

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await deactivateUniversity(universityId);
          toast.success("University deactivated.");
          onSuccess?.();
        })
      }
    >
      Deactivate
    </Button>
  );
}
