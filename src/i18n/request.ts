import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isLocale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;

  const messages = locale === "en" ? (await import("../messages/en.json")).default : (await import("../messages/pt.json")).default;

  return { locale, messages };
});
