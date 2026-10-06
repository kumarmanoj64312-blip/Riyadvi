import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

/** Default social share image (1200×630), generated at build time — no design file needed. */
export const alt = `${siteConfig.name} — Custom Software & Digital Solutions`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const nodes = [
    [860, 140], [1010, 210], [1090, 360], [980, 500], [820, 470], [760, 300], [930, 330],
  ];
  const links = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [6, 0], [6, 2], [6, 4]];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#000", padding: 72, position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 78% 45%, rgba(212,175,55,0.28), transparent 55%)" }} />
        <svg width="1200" height="630" style={{ position: "absolute", left: 0, top: 0 }}>
          {links.map(([a, b]) => (
            <line key={`${a}-${b}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke="#b8941f" strokeWidth="2" />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === 6 ? 22 : 9} fill={i === 6 ? "#d4af37" : "#f5e27a"} />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640 }}>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#f5f5f4" }}>
            Riyadvi<span style={{ color: "#d4af37" }}>.</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 22, letterSpacing: 6, color: "#d4af37", textTransform: "uppercase" }}>Technology & Digital Solutions Partner</div>
            <div style={{ fontSize: 64, fontWeight: 700, color: "#f5f5f4", lineHeight: 1.05, marginTop: 20 }}>
              Custom Software & Digital Solutions to Grow Your Business
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#a1a1aa" }}>{`Web · Apps · UI/UX · AR/VR · 3D · Marketing — since ${siteConfig.founded}`}</div>
        </div>
      </div>
    ),
    size,
  );
}
