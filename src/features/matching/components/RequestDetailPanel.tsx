"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  addCandidateAction,
  removeCandidateAction,
  scheduleInterviewAction,
  recordInterviewOutcomeAction,
  recommendToFamilyAction,
  searchCandidatesForRequestAction,
} from "../actions";
import type { RequestDetail, CandidateSearchResult, CandidateSummary } from "../types";

export function RequestDetailPanel({ request }: { request: RequestDetail }) {
  const t = useTranslations("admin.requests");
  const tContactStatus = useTranslations("admin.requests.contactStatus");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchResults, setSearchResults] = useState<CandidateSearchResult[] | null>(null);
  const [selected, setSelected] = useState<Record<string, { checked: boolean; note: string }>>({});

  function refresh() {
    router.refresh();
  }

  function handleSearch() {
    startTransition(async () => {
      const result = await searchCandidatesForRequestAction(request.id);
      if (result.ok) setSearchResults(result.data);
    });
  }

  function handleAddCandidate(nannyUserId: string) {
    startTransition(async () => {
      await addCandidateAction({ requestId: request.id, nannyUserId });
      setSearchResults((prev) => prev?.filter((n) => n.userId !== nannyUserId) ?? null);
      refresh();
    });
  }

  function handleRemoveCandidate(candidateId: string) {
    startTransition(async () => {
      await removeCandidateAction(candidateId);
      refresh();
    });
  }

  function toggleSelect(candidateId: string) {
    setSelected((prev) => ({
      ...prev,
      [candidateId]: { checked: !prev[candidateId]?.checked, note: prev[candidateId]?.note ?? "" },
    }));
  }

  function setNote(candidateId: string, note: string) {
    setSelected((prev) => ({
      ...prev,
      [candidateId]: { checked: prev[candidateId]?.checked ?? false, note },
    }));
  }

  const selectedCount = Object.values(selected).filter((v) => v.checked).length;

  function handleRecommend() {
    const chosen = Object.entries(selected)
      .filter(([, v]) => v.checked)
      .map(([id, v]) => ({ candidateId: id, note: v.note }));
    if (chosen.length === 0 || chosen.length > 3) return;
    startTransition(async () => {
      await recommendToFamilyAction({ requestId: request.id, candidates: chosen });
      setSelected({});
      refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("matchingPanelTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button onClick={handleSearch} disabled={isPending} className="w-fit">
            {t("searchCandidates")}
          </Button>
          {searchResults && searchResults.length === 0 && (
            <p className="text-sm text-plat-ink-muted">{t("noResults")}</p>
          )}
          {searchResults && searchResults.length > 0 && (
            <div className="flex flex-col gap-2">
              {searchResults.map((n) => (
                <div
                  key={n.userId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-plat-border p-3"
                >
                  <div>
                    <p className="font-medium text-plat-ink">{n.fullName}</p>
                    <p className="text-sm text-plat-ink-muted">
                      {n.city}, {n.province} · {n.yearsExperience} · {n.skills.join(", ")}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => handleAddCandidate(n.userId)} disabled={isPending}>
                    {t("addAsCandidate")}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("candidatesTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {request.candidates.length === 0 && (
            <p className="text-sm text-plat-ink-muted">{t("noCandidatesYet")}</p>
          )}
          {request.candidates.map((candidate) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              checked={selected[candidate.id]?.checked ?? false}
              note={selected[candidate.id]?.note ?? ""}
              onToggleSelect={() => toggleSelect(candidate.id)}
              onNoteChange={(note) => setNote(candidate.id, note)}
              onRemove={() => handleRemoveCandidate(candidate.id)}
              onRefresh={refresh}
              isPending={isPending}
              tContactStatus={tContactStatus}
            />
          ))}
        </CardContent>
      </Card>

      {request.candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("recommendTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-plat-ink-muted">{t("selectUpToThree")}</p>
            <Button
              onClick={handleRecommend}
              disabled={isPending || selectedCount === 0 || selectedCount > 3}
              className="w-fit"
            >
              {t("recommendSubmit")} ({selectedCount})
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CandidateRow({
  candidate,
  checked,
  note,
  onToggleSelect,
  onNoteChange,
  onRemove,
  onRefresh,
  isPending,
  tContactStatus,
}: {
  candidate: CandidateSummary;
  checked: boolean;
  note: string;
  onToggleSelect: () => void;
  onNoteChange: (note: string) => void;
  onRemove: () => void;
  onRefresh: () => void;
  isPending: boolean;
  tContactStatus: ReturnType<typeof useTranslations>;
}) {
  const t = useTranslations("admin.requests");
  const tMode = useTranslations("admin.requests.interviewMode");
  const tInterviewStatus = useTranslations("admin.requests.interviewStatus");
  const [localPending, startTransition] = useTransition();

  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState("");
  const [outcome, setOutcome] = useState("");
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState("");

  function handleSchedule() {
    if (!scheduledAt || !mode) return;
    startTransition(async () => {
      await scheduleInterviewAction({ candidateId: candidate.id, scheduledAt, mode: mode as never });
      onRefresh();
    });
  }

  function handleRecordOutcome() {
    if (!candidate.interview || !outcome) return;
    startTransition(async () => {
      await recordInterviewOutcomeAction({
        interviewId: candidate.interview!.id,
        outcome,
        notes,
        score: score ? Number(score) : undefined,
      });
      onRefresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-plat-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Checkbox checked={checked} onCheckedChange={onToggleSelect} className="mt-1" />
          <div>
            <p className="font-medium text-plat-ink">{candidate.nannyName}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <Badge variant={candidate.contactStatus === "NOT_INTERESTED" ? "danger" : "outline"}>
                {tContactStatus(candidate.contactStatus as never)}
              </Badge>
              {candidate.availabilityConfirmed && <Badge variant="success">{t("availabilityConfirmed")}</Badge>}
              {candidate.isRecommended && <Badge variant="gold">★</Badge>}
              {candidate.interview && (
                <Badge variant="info">{tInterviewStatus(candidate.interview.status as never)}</Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onRemove} disabled={isPending}>
          {t("removeCandidate")}
        </Button>
      </div>

      {checked && (
        <Textarea
          placeholder={t("recommendNoteLabel")}
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={2}
        />
      )}

      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {candidate.interview ? t("rescheduleInterview") : t("scheduleInterview")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("scheduleInterview")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>{t("scheduledAtLabel")}</Label>
                <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{t("modeLabel")}</Label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN_PERSON">{tMode("IN_PERSON")}</SelectItem>
                    <SelectItem value="PHONE">{tMode("PHONE")}</SelectItem>
                    <SelectItem value="VIDEO">{tMode("VIDEO")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSchedule} disabled={localPending || !scheduledAt || !mode}>
                {t("scheduleInterview")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {candidate.interview && candidate.interview.status !== "DONE" && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                {t("recordOutcome")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("recordOutcome")}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>{t("outcomeLabel")}</Label>
                  <Input value={outcome} onChange={(e) => setOutcome(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t("notesLabel")}</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{t("scoreLabel")}</Label>
                  <Input type="number" min={0} max={10} value={score} onChange={(e) => setScore(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleRecordOutcome} disabled={localPending || !outcome}>
                  {t("recordOutcome")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
