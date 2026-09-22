import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import { getNannyDetail } from "@/features/admin-nannies/service";
import { NannyDetailActions } from "@/features/admin-nannies/components/NannyDetailActions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminNannyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const { id } = await params;
  const detail = await getNannyDetail(id);
  if (!detail) notFound();

  const t = await getTranslations("admin.nannies");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-plat-ink">{detail.user.fullName}</h1>
        <Badge>{detail.profile.status}</Badge>
      </div>

      <NannyDetailActions nannyUserId={detail.user.id} />

      <Card>
        <CardHeader>
          <CardTitle>{t("detailTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Email" value={detail.user.email ?? "—"} />
          <Field label="Telefone" value={detail.user.phone ?? "—"} />
          <Field label="WhatsApp" value={detail.user.whatsapp ?? "—"} />
          <Field label="Localização" value={`${detail.user.city}, ${detail.user.province}`} />
          <Field label="Data de nascimento" value={detail.profile.birthDate?.slice(0, 10) ?? "—"} />
          <Field label="Idiomas" value={detail.profile.languages.join(", ") || "—"} />
          <Field label="Anos de experiência" value={detail.profile.yearsExperience?.toString() ?? "—"} />
          <Field label="Faixas etárias" value={detail.profile.ageGroups.join(", ") || "—"} />
          <Field label="Competências" value={detail.profile.skills.join(", ") || "—"} />
          <Field
            label="Salário"
            value={
              detail.profile.salaryMin != null
                ? `${detail.profile.salaryMin} - ${detail.profile.salaryMax} AOA (${detail.profile.salaryUnit})`
                : "—"
            }
          />
          <Field label="Verificada" value={detail.profile.verified ? "Sim" : "Não"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {detail.documents.map((doc) => (
            <a
              key={doc.id}
              href={`/api/files/${doc.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-md border border-plat-border px-3 py-2 text-sm hover:bg-plat-bg-pink/40"
            >
              <span>
                {doc.type} — {doc.originalName}
              </span>
              <Badge variant={doc.reviewStatus === "ACCEPTED" ? "success" : "outline"}>{doc.reviewStatus}</Badge>
            </a>
          ))}
          {detail.documents.length === 0 && <p className="text-plat-ink-muted">—</p>}
        </CardContent>
      </Card>

      {detail.profile.correctionNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Notas de correção</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {detail.profile.correctionNotes.map((note: { field: string; note: string }, index: number) => (
              <div key={index} className="rounded-md bg-plat-warning/10 p-3 text-sm">
                <strong>{note.field}:</strong> {note.note}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-plat-ink-muted">{label}</div>
      <div className="text-sm text-plat-ink">{value}</div>
    </div>
  );
}
