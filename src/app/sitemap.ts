import type { MetadataRoute } from "next";

const PUBLIC_ROUTES = [
  "",
  "/sobre",
  "/como-funciona",
  "/contacto",
  "/termos",
  "/privacidade",
  "/login",
  "/registrar/familia",
  "/registrar/baba",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  return PUBLIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}
