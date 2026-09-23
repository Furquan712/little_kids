"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { respondToInvitationAction } from "../actions";
import type { NannyInvitation } from "../types";

export function InvitationCard({ invitation }: { invitation: NannyInvitation }) {
  const t = useTranslations("nannyInvitations");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function respond(accept: boolean) {
    startTransition(async () => {
      await respondToInvitationAction({ candidateId: invitation.candidateId, accept });
      router.refresh();
    });
  }

  const pending = invitation.contactStatus === "CONTACTED";

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6">
        <div className="flex items-center justify-between">
          <Badge variant={pending ? "outline" : invitation.contactStatus === "INTERESTED" ? "success" : "danger"}>
            {t(`status.${invitation.contactStatus}` as never)}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-1 text-sm text-plat-ink sm:grid-cols-2">
          <p>
            {t("childrenAges")}: {invitation.childrenAges.join(", ") || "—"}
          </p>
          <p>
            {t("liveIn")}: {invitation.liveIn ?? "—"}
          </p>
          <p>
            {t("startDate")}:{" "}
            {invitation.startDate ? new Date(invitation.startDate).toLocaleDateString("pt-AO") : "—"}
          </p>
          <p>
            {t("budget")}: {invitation.budgetMin ?? "—"} – {invitation.budgetMax ?? "—"} AOA
          </p>
          <p className="sm:col-span-2">
            {t("needs")}: {invitation.needs || "—"}
          </p>
          {invitation.specialRequirements && (
            <p className="sm:col-span-2">
              {t("specialRequirements")}: {invitation.specialRequirements}
            </p>
          )}
        </div>
        {pending && (
          <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={() => respond(true)}>
              {t("accept")}
            </Button>
            <Button size="sm" variant="outline" disabled={isPending} onClick={() => respond(false)}>
              {t("decline")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
