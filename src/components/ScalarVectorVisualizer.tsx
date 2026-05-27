import React, { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Cpu, Layers, HelpCircle } from "lucide-react";

export default function ScalarVectorVisualizer() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [scalarStep, setScalarStep] = useState(0); 
  const [simdCycle, setSimdCycle] = useState(0); // 0 or 1 loops

  // Scalar execution has 4 sequential steps
  // SIMD has 1 step
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setScalarStep((prev) => (prev + 1) % 4);
      setSimdCycle((prev) => (prev + 1) % 2);
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const resetVisuals = () => {
    setScalarStep(0);
    setSimdCycle(0);
  };

  return (
    <div className="p-5 rounded-xl border border-[#1e293b]/80 bg-[#070b13] space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b]/40 pb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2 font-sans tracking-wide uppercase">
            <Cpu className="w-4 h-4 text-indigo-400" />
            Scalar vs Vector Register Run (Interactive Simulator)
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
            Observe ALU core clock instruction retirement loops
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" /> Resume Run
              </>
            )}
          </button>
          <button
            onClick={resetVisuals}
            className="p-1.5 rounded border border-[#1e293b] hover:bg-[#151c2c] text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
            title="Reset Clock Cycles"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Double Visual Comparison columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scalar Module (Step by Step) */}
        <div className="p-4 rounded-lg bg-[#0a0e17] border border-[#1e293b]/50 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border-l border-b border-amber-500/20 rounded-bl-lg">
            SISO - 4 Clock Cycles
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-300 font-sans tracking-wider uppercase mb-1">
              BEFORE (Scalar Execution)
            </h4>
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              Traditional CPU loop. Fetches, decodes, and computes exactly 1 independent addition operand at a time.
            </p>
          </div>

          {/* Interactive Steps Visual Container */}
          <div className="py-4 space-y-3 relative min-h-[180px] flex flex-col justify-center">
            {[0, 1, 2, 3].map((step) => {
              const isActive = scalarStep === step;
              return (
                <div 
                  key={step}
                  className={`flex items-center justify-between px-3 py-2 rounded border transition-all duration-300 ${
                    isActive 
                      ? "bg-amber-500/10 border-amber-500/40 translate-x-2 shadow-[0_0_12px_rgba(245,158,11,0.15)]" 
                      : "bg-[#0c101c]/45 border-[#1e293b]/30 opacity-40 scale-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                      isActive ? "bg-amber-500 text-[#070b13]" : "bg-[#182035] text-gray-500"
                    }`}>
                      {step}
                    </span>
                    <span className="font-mono text-xs text-gray-200">
                      A[{step}] + B[{step}] = C[{step}]
                    </span>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase animate-pulse">
                      Retiring Instruction...
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Statistics summary bar */}
          <div className="p-2.5 rounded bg-[#101423] border border-[#1e293b]/30 text-center">
            <span className="text-xs font-mono text-amber-400 font-semibold">
              4 Instructions → 4 Operations (Takes 4 cycles)
            </span>
          </div>
        </div>

        {/* Vectorized Module (All at Once) */}
        <div className="p-4 rounded-lg bg-[#0a0e17] border border-[#1e293b]/50 flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border-l border-b border-emerald-500/20 rounded-bl-lg">
            SIMD - 1 Clock Cycle
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-300 font-sans tracking-wider uppercase mb-1">
              AFTER (SIMD Vector Execution)
            </h4>
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              Vector registers packed in memory. Fetches and processes multiple lanes in a single 128-bit register load.
            </p>
          </div>

          {/* SIMD Packed Registers Animation */}
          <div className="py-4 space-y-4 min-h-[180px] flex flex-col justify-center">
            {/* Vector A */}
            <div className={`space-y-1 transition-all duration-500 ${simdCycle === 0 ? "scale-98 opacity-80" : "scale-100 opacity-100"}`}>
              <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase">
                128-bit Intel XMM Register A (Packed Integers)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((val) => (
                  <div 
                    key={val}
                    className="p-2.5 rounded border border-[#1e293b] bg-indigo-500/5 text-center font-mono text-xs text-indigo-400 font-bold shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-transform duration-300"
                  >
                    A[{val}]
                  </div>
                ))}
              </div>
            </div>

            {/* Arithmetic Sign */}
            <div className="flex justify-center my-[-4px]">
              <div className="text-sm font-bold text-indigo-500 font-mono shadow-[0_0_8px_rgba(99,102,241,0.2)] bg-[#121827] w-6 h-6 rounded-full flex items-center justify-center border border-indigo-500/20">
                +
              </div>
            </div>

            {/* Vector B */}
            <div className={`space-y-1 transition-all duration-500 ${simdCycle === 0 ? "scale-98 opacity-80" : "scale-100 opacity-100"}`}>
              <span className="text-[9px] font-mono text-gray-400 tracking-wider uppercase">
                128-bit Intel XMM Register B (Packed Integers)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((val) => (
                  <div 
                    key={val}
                    className="p-2.5 rounded border border-[#1e293b] bg-indigo-500/5 text-center font-mono text-xs text-indigo-400 font-bold shadow-[0_0_10px_rgba(99,102,241,0.1)] transition-transform duration-300"
                  >
                    B[{val}]
                  </div>
                ))}
              </div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center items-center h-4 text-emerald-400 animate-pulse font-bold text-center text-sm">
              ↓↓↓↓
            </div>

            {/* Vector C Result */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-emerald-400 tracking-wider uppercase">
                SIMD Output Register C (Retired)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((val) => (
                  <div 
                    key={val}
                    className="p-2.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-center font-mono text-xs text-emerald-400 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  >
                    C[{val}]
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Statistics summary bar */}
          <div className="p-2.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="text-xs font-mono text-emerald-400 font-bold">
              1 Instruction → 4 Operations (Registers executed in 1 Cycle!)
            </span>
          </div>
        </div>

      </div>

      {/* Explanatory footer bubble */}
      <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-lg flex items-start gap-2 text-xs text-indigo-200">
        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>SIMD (Single Instruction Multiple Data)</strong> allows high performance compilation of parallel array structures. SSE, AVX, and Neon registers store packed sequences, computing full arrays in a fraction of traditional multi-branch loops.
        </span>
      </div>

    </div>
  );
}
