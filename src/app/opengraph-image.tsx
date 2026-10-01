import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoBuffer = fs.readFileSync(path.join(process.cwd(), "public/images/logo.png"));
  const logoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          backgroundColor: "#FDF6EF",
          backgroundImage: "linear-gradient(135deg, #FDF6EF 0%, #F9E1DD 100%)",
        }}
      >
        <img
          src={logoDataUrl}
          width={160}
          height={160}
          alt=""
          style={{ borderRadius: "50%", boxShadow: "0 8px 24px rgba(60,46,41,0.2)" }}
        />
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#3C2E29" }}>{BRAND_NAME}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#7A655E" }}>{BRAND_TAGLINE}</div>
      </div>
    ),
    { ...size },
  );
}
