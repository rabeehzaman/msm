"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useT } from "@/lib/i18n/client";

const BUCKET = "mahallu-files";

// Phone photos are large; a 1600px JPEG is plenty to read a bill.
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    return blob ?? file;
  } catch {
    return file;
  }
}

// Uploads straight to the private bucket and puts the path in a hidden field of the form.
export function PhotoField({ folder, label, name = "photoPath" }: { folder: string; label: string; name?: string }) {
  const t = useT();
  const input = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    try {
      const blob = await shrink(file);
      const target = `${folder}/${new Date().getFullYear()}/${crypto.randomUUID()}.jpg`;
      const { error } = await createClient().storage.from(BUCKET).upload(target, blob, { contentType: blob.type || "image/jpeg" });
      if (error) throw error;
      setPath(target);
      setPreview(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      toast.error(t("The photo could not be uploaded. You can save without it."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input type="hidden" name={name} value={path ?? ""} />
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={label}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      {preview ? (
        <div className="relative w-fit">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="h-24 rounded-xl border object-cover" />
          <button
            type="button"
            aria-label={t("Remove photo")}
            onClick={() => {
              setPath(null);
              setPreview(null);
            }}
            className="bg-background absolute -top-2 -right-2 rounded-full border p-1"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" className="self-start" disabled={busy} onClick={() => input.current?.click()}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {t(busy ? "Uploading..." : "Add photo")}
        </Button>
      )}
    </div>
  );
}

// A small button that opens a stored private photo with a short-lived link.
export function PhotoButton({ path }: { path: string }) {
  const t = useT();
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || url) return;
    createClient()
      .storage.from(BUCKET)
      .createSignedUrl(path, 3600)
      .then(({ data, error }) => {
        if (error || !data) toast.error(t("The photo could not be opened."));
        else setUrl(data.signedUrl);
      });
  }, [open, path, url, t]);

  return (
    <>
      <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t("Photo")} onClick={() => setOpen(true)}>
        <ImageIcon className="size-4" />
      </Button>
      {open && (
        <Dialog open onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Photo")}</DialogTitle>
            </DialogHeader>
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={t("Photo")} className="max-h-[70dvh] w-full rounded-xl object-contain" />
            ) : (
              <Loader2 className="mx-auto size-6 animate-spin" />
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
