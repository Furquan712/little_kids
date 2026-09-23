"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadDocumentAction, removeDocumentAction } from "../actions";
import type { SerializedNannyDocument, DocumentType as DocType } from "../types";

const DOCUMENT_TYPES: { type: DocType; labelKey: string; required: boolean }[] = [
  { type: "PHOTO", labelKey: "photoLabel", required: true },
  { type: "ID", labelKey: "idLabel", required: true },
  { type: "REFERENCE", labelKey: "referenceLabel", required: false },
  { type: "CERTIFICATE", labelKey: "certificateLabel", required: false },
  { type: "MEDICAL", labelKey: "medicalLabel", required: false },
];

export function DocumentsStepForm({ documents }: { documents: SerializedNannyDocument[] }) {
  const t = useTranslations("nannyProfile.documents");
  const tCommon = useTranslations();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleUpload(type: DocType) {
    const input = fileInputRefs.current[type];
    const file = input?.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("type", type);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadDocumentAction(formData);
      if (!result.ok) {
        setError(tCommon(result.error));
        return;
      }
      if (input) input.value = "";
      router.refresh();
    });
  }

  function handleRemove(documentId: string) {
    startTransition(async () => {
      await removeDocumentAction(documentId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {DOCUMENT_TYPES.map(({ type, labelKey, required }) => {
        const uploaded = documents.filter((d) => d.type === type);
        return (
          <div key={type} className="rounded-lg border border-plat-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-plat-ink">
                {t(labelKey)} {required && <span className="text-plat-danger">*</span>}
              </span>
            </div>

            {uploaded.map((doc) => (
              <div key={doc.id} className="mb-2 flex items-center justify-between rounded-md bg-plat-bg-pink/40 px-3 py-2">
                <span className="truncate text-sm text-plat-ink">{doc.originalName}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={doc.reviewStatus === "ACCEPTED" ? "success" : doc.reviewStatus === "REJECTED" ? "danger" : "outline"}>
                    {doc.reviewStatus}
                  </Badge>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemove(doc.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <input
                ref={(el) => {
                  fileInputRefs.current[type] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                className="text-sm text-plat-ink-muted"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => handleUpload(type)} disabled={isPending}>
                <Upload className="h-4 w-4" /> {t("upload")}
              </Button>
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-plat-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/baba/perfil/disponibilidade")}>
          {tCommon("common.back")}
        </Button>
        <Button type="button" onClick={() => router.push("/baba/perfil/revisao")}>
          {tCommon("common.next")}
        </Button>
      </div>
    </div>
  );
}
