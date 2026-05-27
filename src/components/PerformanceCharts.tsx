import React, { useEffect, useState } from "react";
import { Gauge, Zap, BarChart, TrendingUp, Cpu } from "lucide-react";
import { SpeedupData } from "../types";

interface PerformanceChartsProps {
  speedup: SpeedupData;
}

export default function PerformanceCharts({ speedup }: PerformanceChartsProps) {
  const { scalar_time, vector_time, ratio } = speedup;
  const ratioNum = parseFloat(ratio.replace("x", "")) || 1.0;

  // Let's implement an animated scalar vs vector bar state
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    setAnimatedProgress(0);
    const timer = setTimeout(() => {
      setAnimatedProgress(1);
    }, 100);
    return () => clearTimeout(timer);
  }, [scalar_time, vector_time]);

  // Calculations for scalar vs vector percentages
  const maxVal = Math.max(scalar_time, vector_time, 1);
  const scalarPct = (scalar_time / maxVal) * 100;
  const vectorPct = (vector_time / maxVal) * 100;

  // Gauge Meter circular calculations
  // Circle radius is 50, circumf = 2 * PI * r = 314
  // We utilize a semi-circle path, so active perimeter path length is half (~157)
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; // ~314
  const strokeDasharray = circumference;
  
  // Speed ratio maps between 1.0x (0%) and 4.0x or higher (100%)
  const minRatio = 1.0;
  const maxRatio = 5.0;
  const ratioFraction = Math.min(Math.max((ratioNum - minRatio) / (maxRatio - minRatio), 0), 1);
  const strokeDashoffset = circumference - (ratioFraction * (circumference / 2));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Execution Time Chart Panel */}
      <div className="p-5 rounded-xl border border-[#1e293b]/70 bg-[#070b13] flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="w-4 h-4 text-indigo-400" />
            <h4 className="text-xs font-semibold text-gray-200 tracking-wider uppercase font-sans">
              Compile Target Loop Execution Time
            </h4>
          </div>
          <p className="text-[11px] text-gray-400 font-sans leading-normal mb-6">
            Compare latency in milliseconds (Smaller bar is better, indicating faster iteration completion)
          </p>
        </div>

        {/* Native Bar Chart Container */}
        <div className="space-y-6 py-4">
          {/* Scalar Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-gray-300">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                Scalar Execution (O0 Compiler Target)
              </div>
              <span className="font-mono text-rose-400 font-bold">{scalar_time.toFixed(2)} ms</span>
            </div>
            <div className="w-full h-8 rounded bg-[#101524] p-1 border border-[#1e293b]/30">
              <div 
                style={{ width: `${animatedProgress * scalarPct}%` }}
                className="h-full rounded-sm bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.15)] transition-all duration-800 ease-out flex items-center justify-end px-2"
              >
                <span className="text-[10px] font-mono font-bold text-white leading-none">1.0x</span>
              </div>
            </div>
          </div>

          {/* Vectorized Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-mono text-gray-300 font-medium">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                SIMD Vectorized Execution (O3 -ftree-vectorize)
              </div>
              <span className="font-mono text-emerald-400 font-bold">{vector_time.toFixed(2)} ms</span>
            </div>
            <div className="w-full h-8 rounded bg-[#101524] p-1 border border-[#1e293b]/30">
              <div 
                style={{ width: `${animatedProgress * vectorPct}%` }}
                className="h-full rounded-sm bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all duration-800 ease-out flex items-center justify-end px-2"
              >
                <span className="text-[10px] font-mono font-bold text-white leading-none">
                  {ratio}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-gray-500 pt-2 border-t border-[#1e293b]/30 flex justify-between">
          <span>Target System: 2026 Core Simulator</span>
          <span>Clock Tick Rate: ~2.4 GHz</span>
        </div>
      </div>

      {/* Speedup Meter Panel */}
      <div className="p-5 rounded-xl border border-[#1e293b]/70 bg-[#070b13] flex flex-col justify-between shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-semibold text-gray-200 tracking-wider uppercase font-sans">
              Parallel Multiplier Gauge
            </h4>
          </div>
          <p className="text-[11px] text-gray-400 font-sans leading-normal">
            Calculated as Scalar Latency / Vectorised Latency
          </p>
        </div>

        {/* Circular Speedometer */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <svg className="w-40 h-24" viewBox="0 0 120 70">
            {/* Background Arch */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="#131b2d"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Active Colored Arc */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="url(#speedup-grad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${circumference / 2}`}
              strokeDashoffset={circumference / 2 - ratioFraction * (circumference / 2)}
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradients */}
            <defs>
              <linearGradient id="speedup-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>

          {/* Glowing Speed Multiplier Info */}
          <div className="text-center mt-[-10px]">
            <span className="text-2xl font-mono font-extrabold text-emerald-400 tracking-tight block drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
              {ratio}
            </span>
            <span className="text-[10px] font-semibold uppercase text-gray-400 font-sans mt-0.5 block flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              {ratioNum > 1.0 ? "Optimized Speedup!" : "Sequential Bottleneck"}
            </span>
          </div>
        </div>

        {/* Dynamic Improvement Tip */}
        <div className="p-2 gap-1.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-gray-300 flex items-center justify-center font-sans">
          <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          {ratioNum > 2.0 ? (
            <span>Vector hardware units saturated correctly. Performance optimized!</span>
          ) : (
            <span>Data dependency restricts execution alignment. Code versioning advised.</span>
          )}
        </div>
      </div>

    </div>
  );
}
