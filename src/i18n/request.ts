import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  return {
    locale: "pt-AO",
    messages: (await import("../messages/pt.json")).default,
  };
});
