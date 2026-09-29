"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { createTicketSchema, TICKET_TYPES, type CreateTicketInput } from "../schemas";
import { createTicketAction, listMyPlacementOptionsAction } from "../actions";
import type { PlacementOption } from "../types";

export function TicketForm({ basePath }: { basePath: string }) {
  const t = useTranslations();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placements, setPlacements] = useState<PlacementOption[]>([]);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { type: "ISSUE", placementId: "", message: "" },
  });

  const type = watch("type");
  const placementId = watch("placementId");

  useEffect(() => {
    if (!open) return;
    listMyPlacementOptionsAction().then((result) => {
      if (result.ok) setPlacements(result.data);
    });
  }, [open]);

  async function onSubmit(values: CreateTicketInput) {
    setError(null);
    const result = await createTicketAction(values);
    if (!result.ok) {
      setError(t(result.error));
      return;
    }
    setOpen(false);
    reset();
    router.push(`${basePath}/${result.data.ticketId}`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{t("support.newTicket")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("support.newTicket")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>{t("support.form.typeLabel")}</Label>
            <Select value={type} onValueChange={(v) => setValue("type", v as never)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TICKET_TYPES.map((ticketType) => (
                  <SelectItem key={ticketType} value={ticketType}>
                    {t(`support.types.${ticketType}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("support.form.placementLabel")}</Label>
            <Select value={placementId || "none"} onValueChange={(v) => setValue("placementId", v === "none" ? "" : v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("support.form.placementNone")}</SelectItem>
                {placements.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>{t("support.form.messageLabel")}</Label>
            <Textarea {...register("message")} rows={4} />
            {errors.message && <p className="text-sm text-plat-danger">{t("auth.errors.unknown")}</p>}
          </div>

          {error && <p className="text-sm text-plat-danger">{error}</p>}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("common.loading") : t("support.form.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
