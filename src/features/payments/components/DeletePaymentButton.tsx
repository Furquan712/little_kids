"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { deletePaymentAction } from "../actions";

export function DeletePaymentButton({ paymentId }: { paymentId: string }) {
  const t = useTranslations("payments.schedule");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await deletePaymentAction(paymentId);
      router.refresh();
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          title={t("deletePayment")}
          aria-label={t("deletePayment")}
          className="text-plat-danger transition-colors hover:text-plat-danger/70"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("confirmDeletePayment")}</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button variant="destructive" disabled={isPending} onClick={handleConfirm}>
            {t("deletePayment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
