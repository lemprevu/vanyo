"use client";

import { motion } from "motion/react";

/** Graphique en aires animé (SVG pur, sans dépendance). */
export function AreaChart({
  data,
  labels,
  height = 220,
}: {
  data: number[];
  labels: string[];
  height?: number;
}) {
  const w = 640;
  const h = height;
  const pad = 24;
  const max = Math.max(...data, 1);
  const stepX = (w - pad * 2) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (v / max) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Évolution des demandes">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6D4AFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#6D4AFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={pad + f * (h - pad * 2)} y2={pad + f * (h - pad * 2)} stroke="rgba(255,255,255,0.06)" />
      ))}
      <motion.path d={area} fill="url(#areaGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.path
        d={line}
        fill="none"
        stroke="#8B5CF6"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#A855F7" />
          <text x={p[0]} y={h - 6} textAnchor="middle" className="fill-white/40 text-[10px]">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Anneau de progression (taux de conversion). */
export function DonutStat({ value, label }: { value: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <motion.circle
          cx="70" cy="70" r={r} fill="none" stroke="url(#donutGrad)" strokeWidth="12" strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          transform="rotate(-90 70 70)"
        />
        <defs>
          <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#6D4AFF" /><stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <text x="70" y="76" textAnchor="middle" className="fill-white text-2xl font-bold">{value}%</text>
      </svg>
      <span className="mt-2 text-sm text-white/55">{label}</span>
    </div>
  );
}
