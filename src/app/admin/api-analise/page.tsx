import { getTranslations } from "next-intl/server";
import { requireRole } from "@/lib/rbac";
import {
  getMongoUsage,
  getBrevoUsage,
  getCloudinaryUsage,
  getAppUploadBreakdown,
  formatBytes,
} from "@/features/api-analysis/service";
import { UsageMeter } from "@/features/api-analysis/components/UsageMeter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-plat-bg-pink/40 p-3.5">
      <span className="text-xs text-plat-ink-muted">{label}</span>
      <span className="text-lg font-semibold text-plat-ink">{value}</span>
    </div>
  );
}

export default async function ApiAnalysisPage() {
  const auth = await requireRole("ADMIN");
  if (!auth.ok) return null;

  const t = await getTranslations("apiAnalysis");
  const [mongo, brevo, cloudinary, appBreakdown] = await Promise.all([
    getMongoUsage(),
    getBrevoUsage(),
    getCloudinaryUsage(),
    getAppUploadBreakdown(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-plat-ink">{t("title")}</h1>
        <p className="text-sm text-plat-ink-muted">{t("subtitle")}</p>
        <p className="mt-1 text-xs text-plat-ink-muted">{t("refreshNote")}</p>
      </div>

      {/* MongoDB */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-plat-ink">{t("mongo.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <UsageMeter percent={mongo.usedPercent} label={t("mongo.storageUsed")} />
          <p className="text-xs text-plat-ink-muted">
            {t("mongo.limitNote", { limit: formatBytes(mongo.limitBytes) })}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatTile label={t("mongo.dataSize")} value={formatBytes(mongo.dataSizeBytes)} />
            <StatTile label={t("mongo.storageSize")} value={formatBytes(mongo.storageSizeBytes)} />
            <StatTile label={t("mongo.indexSize")} value={formatBytes(mongo.indexSizeBytes)} />
            <StatTile label={t("mongo.collections")} value={mongo.collections} />
            <StatTile label={t("mongo.documents")} value={mongo.documents} />
          </div>
        </CardContent>
      </Card>

      {/* Brevo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-plat-ink">{t("brevo.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {"error" in brevo ? (
            <p className="text-sm text-plat-ink-muted">
              {brevo.error === "BREVO_NOT_CONFIGURED" ? t("brevo.notConfigured") : t("brevo.fetchFailed")}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-plat-ink-muted">{t("brevo.emailSection")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <StatTile label={t("brevo.plan")} value={brevo.emailPlanType ?? "—"} />
                  <StatTile
                    label={t("brevo.creditsLeft")}
                    value={brevo.emailCreditsLeft?.toLocaleString() ?? "—"}
                  />
                  <StatTile
                    label={t("brevo.sentLast90")}
                    value={brevo.emailSentLast90Days?.toLocaleString() ?? "—"}
                  />
                  <StatTile
                    label={t("brevo.deliveredLast90")}
                    value={brevo.emailDeliveredLast90Days?.toLocaleString() ?? "—"}
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-plat-ink-muted">{t("brevo.smsSection")}</h3>
                {brevo.smsPlanType === null && brevo.smsSentLast90Days === null ? (
                  <p className="text-sm text-plat-ink-muted">{t("brevo.noSmsPlan")}</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <StatTile label={t("brevo.plan")} value={brevo.smsPlanType ?? "—"} />
                    <StatTile
                      label={t("brevo.creditsLeft")}
                      value={brevo.smsCreditsLeft?.toLocaleString() ?? "—"}
                    />
                    <StatTile
                      label={t("brevo.sentLast90")}
                      value={brevo.smsSentLast90Days?.toLocaleString() ?? "—"}
                    />
                    <StatTile
                      label={t("brevo.deliveredLast90")}
                      value={brevo.smsDeliveredLast90Days?.toLocaleString() ?? "—"}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cloudinary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-plat-ink">{t("cloudinary.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {"error" in cloudinary ? (
            <p className="text-sm text-plat-ink-muted">{t("cloudinary.fetchFailed")}</p>
          ) : (
            <>
              {cloudinary.creditsLimit !== null && cloudinary.creditsUsedPercent !== null && (
                <UsageMeter percent={cloudinary.creditsUsedPercent} label={t("cloudinary.credits")} />
              )}
              <p className="text-xs text-plat-ink-muted">{t("cloudinary.creditsNote")}</p>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatTile label={t("cloudinary.plan")} value={cloudinary.plan} />
                <StatTile label={t("cloudinary.storageUsed")} value={formatBytes(cloudinary.storageUsedBytes)} />
                <StatTile label={t("cloudinary.bandwidthUsed")} value={formatBytes(cloudinary.bandwidthUsedBytes)} />
                <StatTile label={t("cloudinary.transformations")} value={cloudinary.transformationsUsed} />
                <StatTile label={t("cloudinary.totalObjects")} value={cloudinary.totalObjects} />
                <StatTile
                  label={t("cloudinary.rateLimit")}
                  value={`${cloudinary.rateLimitRemaining} / ${cloudinary.rateLimitAllowed}`}
                />
              </div>

              <div className="border-t border-plat-border pt-4">
                <h3 className="mb-3 text-sm font-semibold text-plat-ink-muted">{t("cloudinary.appBreakdownTitle")}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <StatTile label={t("cloudinary.images")} value={appBreakdown.images} />
                  <StatTile label={t("cloudinary.documents")} value={appBreakdown.documents} />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
