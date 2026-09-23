"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { suspendFamilyAction, reactivateFamilyAction } from "../actions";

export function FamilyDetailActions({ familyId, status }: { familyId: string; status: string }) {
  const t = useTranslations("admin.families");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleReactivate() {
    startTransition(async () => {
      await reactivateFamilyAction(familyId);
      router.refresh();
    });
  }

  function handleSuspend() {
    startTransition(async () => {
      await suspendFamilyAction(familyId);
      router.refresh();
    });
  }

  if (status === "SUSPENDED") {
    return (
      <Button variant="outline" disabled={isPending} onClick={handleReactivate}>
        {t("reactivate")}
      </Button>
    );
  }

  return (
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
          <Button variant="destructive" disabled={isPending} onClick={handleSuspend}>
            {t("suspend")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
