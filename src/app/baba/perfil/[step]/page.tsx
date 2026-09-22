import { notFound } from "next/navigation";
import { requireRole } from "@/lib/rbac";
import { getOrCreateNannyProfile, listNannyDocuments } from "@/features/nanny-profile/service";
import { PROFILE_STEPS, type ProfileStep } from "@/features/nanny-profile/types";
import { StepTabs } from "@/features/nanny-profile/components/StepTabs";
import { PersonalStepForm } from "@/features/nanny-profile/components/PersonalStepForm";
import { ExperienceStepForm } from "@/features/nanny-profile/components/ExperienceStepForm";
import { AvailabilityStepForm } from "@/features/nanny-profile/components/AvailabilityStepForm";
import { DocumentsStepForm } from "@/features/nanny-profile/components/DocumentsStepForm";
import { ReviewStep } from "@/features/nanny-profile/components/ReviewStep";

export default async function NannyProfileStepPage({
  params,
}: {
  params: Promise<{ step: string }>;
}) {
  const { step } = await params;
  if (!PROFILE_STEPS.includes(step as ProfileStep)) {
    notFound();
  }

  const auth = await requireRole("NANNY");
  if (!auth.ok) notFound();

  const profileDoc = await getOrCreateNannyProfile(auth.user.id);
  const documentDocs = await listNannyDocuments(auth.user.id);

  const profile = {
    birthDate: profileDoc.birthDate ? profileDoc.birthDate.toISOString() : null,
    languages: profileDoc.languages ?? [],
    yearsExperience: profileDoc.yearsExperience ?? null,
    ageGroups: profileDoc.ageGroups ?? [],
    skills: profileDoc.skills ?? [],
    otherSkills: profileDoc.otherSkills ?? "",
    employmentType: profileDoc.employmentType ?? null,
    liveIn: profileDoc.liveIn ?? null,
    availability: (profileDoc.availability ?? []).map((slot: { day: string; from: string; to: string }) => ({
      day: slot.day,
      from: slot.from,
      to: slot.to,
    })),
    salaryMin: profileDoc.salaryMin ?? null,
    salaryMax: profileDoc.salaryMax ?? null,
    salaryUnit: profileDoc.salaryUnit ?? null,
    bio: profileDoc.bio ?? "",
    status: profileDoc.status,
    correctionNotes: (profileDoc.correctionNotes ?? []).map((note: { field: string; note: string; createdAt?: Date }) => ({
      field: note.field,
      note: note.note,
      createdAt: note.createdAt ? note.createdAt.toISOString() : "",
    })),
  };

  const documents = documentDocs.map((doc) => ({
    id: doc._id.toString(),
    type: doc.type,
    originalName: doc.originalName,
    reviewStatus: doc.reviewStatus,
    reviewNote: doc.reviewNote ?? undefined,
  }));

  return (
    <div className="mx-auto max-w-3xl">
      <StepTabs current={step as ProfileStep} />
      {step === "dados-pessoais" && <PersonalStepForm profile={profile} />}
      {step === "experiencia" && <ExperienceStepForm profile={profile} />}
      {step === "disponibilidade" && <AvailabilityStepForm profile={profile} />}
      {step === "documentos" && <DocumentsStepForm documents={documents} />}
      {step === "revisao" && <ReviewStep profile={profile} />}
    </div>
  );
}
