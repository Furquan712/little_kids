"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  approveNannyAction,
  requestCorrectionAction,
  markVerifiedAction,
  suspendNannyAction,
  setManualStatusAction,
} from "../actions";

export function NannyDetailActions({ nannyUserId }: { nannyUserId: string }) {
  const t = useTranslations("admin.nannies");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [correctionField, setCorrectionField] = useState("");
  const [correctionNote, setCorrectionNote] = useState("");
  const [manualStatus, setManualStatus] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function refreshAfter(action: () => Promise<{ ok: boolean }>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setMessage(t("actionSuccess"));
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={isPending} onClick={() => refreshAfter(() => approveNannyAction(nannyUserId))}>
        {t("approve")}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" disabled={isPending}>
            {t("requestCorrection")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("requestCorrection")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>{t("correctionFieldLabel")}</Label>
              <Input value={correctionField} onChange={(e) => setCorrectionField(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{t("correctionNoteLabel")}</Label>
              <Textarea value={correctionNote} onChange={(e) => setCorrectionNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isPending || !correctionField || !correctionNote}
              onClick={() =>
                refreshAfter(() =>
                  requestCorrectionAction({ nannyUserId, field: correctionField, note: correctionNote }),
                )
              }
            >
              {t("requestCorrection")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Button variant="outline" disabled={isPending} onClick={() => refreshAfter(() => markVerifiedAction(nannyUserId))}>
        {t("markVerified")}
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive" disabled={isPending}>
            {t("suspend")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmSuspend")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => refreshAfter(() => suspendNannyAction(nannyUserId))}
            >
              {t("suspend")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2">
        <Select value={manualStatus} onValueChange={setManualStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOT_AVAILABLE">{t("setNotAvailable")}</SelectItem>
            <SelectItem value="IN_NEGOTIATION">{t("setInNegotiation")}</SelectItem>
            <SelectItem value="PLACED">{t("setPlaced")}</SelectItem>
            <SelectItem value="APPROVED">{t("approve")}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          disabled={isPending || !manualStatus}
          onClick={() =>
            refreshAfter(() =>
              setManualStatusAction({ nannyUserId, status: manualStatus as never }),
            )
          }
        >
          {t("applyStatus")}
        </Button>
      </div>

      {message && <span className="text-sm text-plat-success">{message}</span>}
    </div>
  );
}
