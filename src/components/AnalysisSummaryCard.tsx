import React from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  HelpCircle, 
  Shuffle, 
  TrendingUp, 
  RefreshCw,
  Binary,
  Link
} from "lucide-react";
import { AnalysisResult } from "../types";

interface AnalysisSummaryCardProps {
  analysis: AnalysisResult;
}

export default function AnalysisSummaryCard({ analysis }: AnalysisSummaryCardProps) {
  const {
    is_vectorizable,
    data_dependency,
    memory_access,
    simd_width,
    loop_type,
    induction_var,
    trip_count,
    reasons
  } = analysis;

  const cards = [
    {
      title: "Auto-Vectorization Quality",
      val: is_vectorizable ? "Eligible" : "Ineligible",
      icon: is_vectorizable ? CheckCircle2 : XCircle,
      colorClass: is_vectorizable ? "text-emerald-400" : "text-rose-400",
      glowClass: is_vectorizable ? "shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-emerald-500/5 border-emerald-500/20" : "shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-rose-500/5 border-rose-500/20",
      desc: is_vectorizable ? "Loop passed dependencies review" : "Auto-vectorization hindered"
    },
    {
      title: "Data Dependency",
      val: data_dependency,
      icon: Link,
      colorClass: data_dependency.toLowerCase().includes("none") ? "text-emerald-400" : "text-amber-400",
      glowClass: "bg-slate-500/5 border-[#1e293b]/80 shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
      desc: "Cross-iteration dependence check"
    },
    {
      title: "Memory Access",
      val: memory_access,
      icon: Shuffle,
      colorClass: memory_access.toLowerCase().includes("sequential") ? "text-indigo-400" : "text-amber-400",
      glowClass: "bg-slate-500/5 border-[#1e293b]/80 shadow-[0_4px_12px_rgba(0,0,0,0.2)]",
      desc: "Stride access stride estimation"
    },
    {
      title: "Recommended SIMD Width",
      val: is_vectorizable ? `${simd_width} Lanes` : "1 Lane (Scalar)",
      icon: Binary,
      colorClass: is_vectorizable ? "text-purple-400" : "text-gray-400",
      glowClass: is_vectorizable ? "shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-purple-500/5 border-purple-500/20" : "bg-slate-500/5 border-[#1e293b]/80",
      desc: is_vectorizable ? "Fits 128-bit SIMD registers" : "Forced single ALU execution"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Upper Grid Card Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i}
              className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between ${card.glowClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-gray-500 tracking-wider uppercase font-sans font-medium">
                  {card.title}
                </span>
                <Icon className={`w-4 h-4 ${card.colorClass}`} />
              </div>
              <div>
                <h3 className={`text-lg font-mono font-bold leading-tight ${card.colorClass}`}>
                  {card.val}
                </h3>
                <p className="text-[11px] text-gray-400 font-sans mt-0.5">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Code Inspector / Parameters Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Loop Properties */}
        <div className="p-4 rounded-xl border border-[#1e293b]/80 bg-[#0c0f17]/90 col-span-2 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1e293b]/40">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-gray-200 tracking-wider uppercase font-sans">
              Analyzed Loop Parameters
            </h4>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-1">
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-sans block">Loop Class</span>
              <span className="text-xs font-mono text-gray-300 block font-medium">{loop_type}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-sans block">Trip Counter</span>
              <span className="text-xs font-mono text-gray-200 block font-bold">{trip_count}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-sans block">Induction Variable</span>
              <span className="text-xs font-mono text-indigo-400 block font-bold">"{induction_var}"</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-gray-500 font-sans block">Target Platform</span>
              <span className="text-xs font-mono text-gray-300 block">x86-64 SSE / Neon</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Report Panel */}
        <div className="p-4 rounded-xl border border-[#1e293b]/80 bg-[#0c0f17]/90 space-y-3 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          <div className="flex items-center gap-2 pb-1.5 border-b border-[#1e293b]/40">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h4 className="text-xs font-semibold text-gray-200 tracking-wider uppercase font-sans">
              Optimizer Notes
            </h4>
          </div>
          <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1">
            {reasons.map((reason, i) => (
              <div key={i} className="flex gap-2 items-start text-[11px] leading-relaxed text-gray-400 font-sans">
                <span className="text-indigo-400 font-semibold">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
