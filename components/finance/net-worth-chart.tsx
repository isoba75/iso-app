"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Snapshot { date: string; sepu: string; sg: string; crypto: string }

export function NetWorthChart({ data }: { data: Snapshot[] }) {
  const chartData = data.map((d) => ({
    date: d.date.slice(0, 7),
    sepu: parseFloat(d.sepu.replace(/[€,]/g, "")) || 0,
  }));

  if (chartData.length < 2) return <p className="text-sm text-[#555]">Need more snapshots for chart</p>;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#555" }} axisLine={false} tickLine={false} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: "#888" }}
          formatter={(v) => [`€${(v as number).toLocaleString()}`, "SEPU"]}
        />
        <Line type="monotone" dataKey="sepu" stroke="#7dd870" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
