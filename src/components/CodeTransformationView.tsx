import React from "react";
import { ArrowRight, HelpCircle, CornerDownRight, CheckCircle } from "lucide-react";

interface CodeTransformationViewProps {
  scalarCode: string;
  vectorCode: string;
  isVectorizable: boolean;
}

export default function CodeTransformationView({
  scalarCode,
  vectorCode,
  isVectorizable
}: CodeTransformationViewProps) {
  return (
    <div className="p-5 rounded-xl border border-[#1e293b]/80 bg-[#070b13] space-y-6 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      {/* Header Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-100 flex items-center gap-2 font-sans tracking-wide uppercase">
          <CornerDownRight className="w-4 h-4 text-purple-400" />
          Code Level Loop Vectorization
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
          Behold how standard sequential loops map into high-level parallel vectorized lanes (SIMD Step-by-4 Execution)
        </p>
      </div>

      {/* Side-by-Side Panel Sections with Entrance Animations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch relative">
        {/* Scalar Original Panel */}
        <div className="p-4 rounded-lg bg-[#0a0e16] border border-[#1e293b]/60 flex flex-col justify-between transition-transform duration-350 hover:scale-[1.01]">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#1e293b]/40">
              <span className="text-xs font-semibold text-amber-400 font-sans tracking-wider uppercase">
                Original Code (Scalar Execution)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Stride: i++ (Serial)
              </span>
            </div>
            
            <pre className="font-mono text-[11px] leading-relaxed text-gray-300 p-3 bg-black/40 rounded border border-[#1f293d]/50 max-h-[300px] overflow-auto select-text whitespace-pre-wrap">
              {scalarCode}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e293b]/30 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5 animate-pulse" />
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              Increments index variable by 1 every iteration. Each statement computes exactly one value sequentially and loops back.
            </p>
          </div>
        </div>

        {/* Floating connector arrow with modern slow-pulsing background */}
        <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 justify-center items-center shadow-[0_0_12px_rgba(99,102,241,0.5)] border border-indigo-400/20 animate-pulse">
          <ArrowRight className="w-4 h-4 text-white animate-bounce-horizontal" />
        </div>

        {/* Vectorized/Optimized Panel */}
        <div className="p-4 rounded-lg bg-[#0a0e16] border border-[#1e293b]/60 flex flex-col justify-between transition-transform duration-350 hover:scale-[1.01]">
          <div>
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#1e293b]/40">
              <span className="text-xs font-semibold text-emerald-400 font-sans tracking-wider uppercase">
                Optimized Code (SIMD Parallel Lanes)
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/20 ${
                isVectorizable 
                  ? "bg-emerald-500/10 text-emerald-400" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                {isVectorizable ? "Stride: i += 4 (Parallel)" : "Dependency Detected: Scalar Stride"}
              </span>
            </div>

            <pre className={`font-mono text-[11px] leading-relaxed p-3 rounded border max-h-[300px] overflow-auto select-text whitespace-pre-wrap transition-colors duration-500 ${
              isVectorizable 
                ? "bg-emerald-950/10 border-emerald-500/20 text-emerald-300"
                : "bg-black/40 border-[#1f293d]/50 text-gray-400"
            }`}>
              {vectorCode}
            </pre>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e293b]/30 flex items-start gap-2">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${isVectorizable ? "bg-emerald-400" : "bg-rose-400"}`} />
            <p className="text-[11px] text-gray-400 leading-normal font-sans">
              {isVectorizable ? (
                <span>
                  The loop is transformed to step by 4 in a single iteration. Multi-lane CPU vector hardware solves all 4 statements concurrently.
                </span>
              ) : (
                <span>
                  Loop contains dependencies preventing parallel unrolling. Must execute in strict scalar sequence to guarantee correct memory values.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Explanatory notes about vectorized translation */}
      {isVectorizable && (
        <div className="p-4 bg-[#0e1726]/40 border border-indigo-500/10 rounded-lg space-y-2">
          <h4 className="text-xs font-semibold text-gray-200 font-sans uppercase flex items-center gap-1.5 border-b border-[#1e293b]/30 pb-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Parallel SIMD Code generation breakdown:
          </h4>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <li className="text-[11px] text-gray-400 font-sans bg-[#101524]/40 p-2.5 rounded border border-[#1e293b]/50">
              <strong className="text-indigo-400 block mb-0.5">Stride Speedup (i += 4)</strong>
              Loops step by 4 elements instead of 1, cutting the total loop iterations down to 25% for high-speed execution.
            </li>
            <li className="text-[11px] text-gray-400 font-sans bg-[#101524]/40 p-2.5 rounded border border-[#1e293b]/50">
              <strong className="text-purple-400 block mb-0.5">Register Packing</strong>
              Elements are grouped into wider CPU register units, allowing a single hardware execution trigger to apply to all packed values.
            </li>
            <li className="text-[11px] text-gray-400 font-sans bg-[#101524]/40 p-2.5 rounded border border-[#1e293b]/50">
              <strong className="text-emerald-400 block mb-0.5">Simultaneous Arithmetic</strong>
              Instead of executing 4 sequential add operations, the ALU performs the mathematical addition logic on all lanes in parallel in 1 clock cycle.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
