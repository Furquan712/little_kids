"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  replyToTicketAction,
  assignTicketAction,
  resolveTicketAction,
  resolveReplacementTicketAction,
} from "../actions";
import type { TicketDetail } from "../types";

const STATUS_VARIANT: Record<string, "warning" | "info" | "success"> = {
  OPEN: "warning",
  IN_PROGRESS: "info",
  RESOLVED: "success",
};

export function TicketThread({
  initialDetail,
  isAdmin,
  currentUserId,
  currentUserName,
}: {
  initialDetail: TicketDetail;
  isAdmin: boolean;
  currentUserId: string;
  currentUserName: string;
}) {
  const t = useTranslations();
  const s = (key: string) => t(`support.${key}`);
  const [detail, setDetail] = useState(initialDetail);
  const [reply, setReply] = useState("");
  const [resolution, setResolution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isResolved = detail.status === "RESOLVED";
  const isReplacement = detail.type === "REPLACEMENT";

  function handleReply() {
    if (!reply.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await replyToTicketAction({ ticketId: detail.id, message: reply });
      if (!result.ok) {
        setError(t("auth.errors.unknown"));
        return;
      }
      setDetail((prev) => ({
        ...prev,
        status: isAdmin && prev.status === "OPEN" ? "IN_PROGRESS" : prev.status,
        messages: [
          ...prev.messages,
          {
            authorId: currentUserId,
            authorName: currentUserName,
            body: reply,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      setReply("");
    });
  }

  function handleAssign() {
    setError(null);
    startTransition(async () => {
      const result = await assignTicketAction(detail.id);
      if (!result.ok) {
        setError(t("auth.errors.unknown"));
        return;
      }
      setDetail((prev) => ({
        ...prev,
        assignedToName: currentUserName,
        status: prev.status === "OPEN" ? "IN_PROGRESS" : prev.status,
      }));
    });
  }

  function handleResolve() {
    if (!resolution.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await resolveTicketAction({ ticketId: detail.id, resolution });
      if (!result.ok) {
        setError(t("auth.errors.unknown"));
        return;
      }
      setDetail((prev) => ({ ...prev, status: "RESOLVED", resolution }));
    });
  }

  function handleResolveAsReplacement() {
    if (!resolution.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await resolveReplacementTicketAction({ ticketId: detail.id, resolution });
      if (!result.ok) {
        setError(t("auth.errors.unknown"));
        return;
      }
      setDetail((prev) => ({ ...prev, status: "RESOLVED", resolution }));
      setSuccessNote(s("replacement.success"));
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-plat-ink">{s(`types.${detail.type}`)}</span>
          {isAdmin && <span className="text-xs text-plat-ink-muted">{detail.openedByName}</span>}
        </div>
        <Badge variant={STATUS_VARIANT[detail.status] ?? "default"}>{s(`statuses.${detail.status}`)}</Badge>
      </div>

      <ul className="flex flex-col gap-3">
        {detail.messages.map((message, i) => (
          <li
            key={i}
            className={cn(
              "max-w-[80%] rounded-xl border border-plat-border p-3",
              message.authorId === currentUserId ? "ml-auto bg-plat-bg-pink" : "bg-plat-bg",
            )}
          >
            <div className="mb-1 text-xs font-medium text-plat-ink-muted">{message.authorName}</div>
            <p className="text-sm text-plat-ink">{message.body}</p>
          </li>
        ))}
      </ul>

      {detail.resolution && (
        <div className="rounded-xl border border-plat-border bg-plat-bg-pink p-3">
          <div className="mb-1 text-xs font-medium text-plat-ink-muted">{s("thread.resolutionLabel")}</div>
          <p className="text-sm text-plat-ink">{detail.resolution}</p>
        </div>
      )}

      {successNote && <p className="text-sm text-plat-success">{successNote}</p>}
      {error && <p className="text-sm text-plat-danger">{error}</p>}

      {!isResolved && (
        <div className="flex flex-col gap-2">
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={s("thread.replyPlaceholder")}
            rows={3}
          />
          <Button onClick={handleReply} disabled={isPending || !reply.trim()} className="self-end">
            {s("thread.send")}
          </Button>
        </div>
      )}

      {isAdmin && !isResolved && (
        <div className="flex flex-col gap-3 rounded-xl border border-plat-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-plat-ink-muted">
              {s("thread.assignedTo")}: {detail.assignedToName ?? s("thread.unassigned")}
            </span>
            <Button variant="outline" size="sm" onClick={handleAssign} disabled={isPending}>
              {s("thread.assign")}
            </Button>
          </div>

          <Textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder={s("thread.resolutionLabel")}
            rows={2}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleResolve} disabled={isPending || !resolution.trim()}>
              {s("thread.resolve")}
            </Button>
            {isReplacement && (
              <Button
                variant="outline"
                onClick={handleResolveAsReplacement}
                disabled={isPending || !resolution.trim()}
              >
                {s("thread.resolveAsReplacement")}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
