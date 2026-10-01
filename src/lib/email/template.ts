import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

const COLORS = {
  bg: "#FDF6EF",
  blush: "#F9E1DD",
  primary: "#E58F89",
  ink: "#3F312D",
  inkMuted: "#826758",
  border: "#EADBD0",
};

/**
 * Every transactional email (auth links, notify()'s event emails) renders
 * through this one branded wrapper, instead of each call site hand-rolling
 * bare <p> tags — inline styles only, since email clients don't load
 * external stylesheets.
 */
export function renderEmailHtml({
  title,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const baseUrl = process.env.APP_BASE_URL ?? "";
  const year = new Date().getFullYear();

  return `
<div style="background-color:${COLORS.bg};padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:480px;margin:0 auto;background-color:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid ${COLORS.border};">
    <div style="background-color:${COLORS.blush};padding:24px 32px;text-align:center;">
      <img src="${baseUrl}/images/logo.png" alt="${BRAND_NAME}" width="40" height="40" style="border-radius:50%;display:block;margin:0 auto 8px;" />
      <div style="font-size:18px;font-weight:700;color:${COLORS.ink};">${BRAND_NAME}</div>
      <div style="font-size:11px;color:${COLORS.inkMuted};letter-spacing:0.05em;text-transform:uppercase;margin-top:2px;">${BRAND_TAGLINE}</div>
    </div>
    <div style="padding:32px;color:${COLORS.ink};">
      <h1 style="font-size:18px;margin:0 0 16px;color:${COLORS.ink};">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:${COLORS.ink};margin:0 0 24px;">${bodyHtml}</div>
      ${
        ctaUrl
          ? `<a href="${ctaUrl}" style="display:inline-block;background-color:${COLORS.primary};color:#FFFFFF;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px;">${ctaLabel ?? ctaUrl}</a>`
          : ""
      }
    </div>
    <div style="padding:16px 32px;background-color:${COLORS.bg};text-align:center;">
      <span style="font-size:12px;color:${COLORS.inkMuted};">© ${year} ${BRAND_NAME}</span>
    </div>
  </div>
</div>
`.trim();
}
