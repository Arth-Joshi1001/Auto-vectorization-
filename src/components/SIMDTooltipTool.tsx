import React, { useState } from "react";
import { Cpu, Info, ShieldCheck, HelpCircle } from "lucide-react";

interface SIMDStandard {
  key: string;
  name: string;
  width: number; // in bits
  floats: number;
  doubles: number;
  ints: number;
  chars: number;
  architect: string;
  introYear: string;
  registers: string;
}

export default function SIMDTooltipTool() {
  const [selectedSpec, setSelectedSpec] = useState<string>("avx2");

  const standards: SIMDStandard[] = [
    {
      key: "sse4",
      name: "Intel SSE 4.2",
      width: 128,
      floats: 4,
      doubles: 2,
      ints: 4,
      chars: 16,
      architect: "Intel (Core i7 era)",
      introYear: "2008",
      registers: "16 x XMM Registers (XMM0 - XMM15)"
    },
    {
      key: "avx2",
      name: "Intel AVX2",
      width: 256,
      floats: 8,
      doubles: 4,
      ints: 8,
      chars: 32,
      architect: "Intel / AMD (Haswell era)",
      introYear: "2013",
      registers: "16/32 x YMM Registers (YMM0 - YMM31)"
    },
    {
      key: "avx512",
      name: "Intel AVX-512",
      width: 512,
      floats: 16,
      doubles: 8,
      ints: 16,
      chars: 64,
      architect: "Intel (Skylake-X / Xeon)",
      introYear: "2017",
      registers: "32 x ZMM Registers (ZMM0 - ZMM31)"
    },
    {
      key: "arm_neon",
      name: "ARM Neon",
      width: 128,
      floats: 4,
      doubles: 2,
      ints: 4,
      chars: 16,
      architect: "ARM Holdings (Cortex-A/Apple)",
      introYear: "2009",
      registers: "32 x D/Q Registers (Q0 - Q15)"
    }
  ];

  const current = standards.find((s) => s.key === selectedSpec) || standards[1];

  return (
    <div className="p-5 rounded-xl border border-[#1e293b]/80 bg-[#070b13] space-y-5 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
      {/* Header Info */}
      <div className="flex items-center gap-2 pb-3 border-b border-[#1e293b]/40">
        <Cpu className="w-4 h-4 text-purple-400" />
        <div>
          <h4 className="text-xs font-semibold text-gray-200 tracking-wider uppercase font-sans">
            SIMD Hardware Register Packing Map
          </h4>
          <p className="text-[10px] text-gray-400 font-sans mt-0.5">
            Select architecture target to check packing capacities
          </p>
        </div>
      </div>

      {/* Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#101423] rounded-lg">
        {standards.map((spec) => (
          <button
            key={spec.key}
            onClick={() => setSelectedSpec(spec.key)}
            className={`px-2 py-2 rounded text-[11px] font-mono leading-none transition-all cursor-pointer ${
              selectedSpec === spec.key
                ? "bg-indigo-600 text-white font-bold shadow-md"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#181f33]/40"
            }`}
          >
            {spec.name}
          </button>
        ))}
      </div>

      {/* Main Details and Packing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* Specification Column */}
        <div className="md:col-span-1 space-y-3 p-3.5 rounded bg-[#090d16] border border-[#1e293b]/40">
          <div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-wider">
              Selected Standard
            </span>
            <h5 className="text-sm font-bold text-gray-200 font-sans mt-0.5">{current.name}</h5>
          </div>

          <div className="space-y-2 text-[11px] font-mono text-gray-400">
            <div>
              <span className="text-gray-500 block">Register Width:</span>
              <span className="text-indigo-300 font-bold">{current.width} bits</span>
            </div>
            <div>
              <span className="text-gray-500 block">Registers Count:</span>
              <span className="text-gray-200">{current.registers}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Developer:</span>
              <span className="text-gray-200">{current.architect} ({current.introYear})</span>
            </div>
          </div>
        </div>

        {/* Lane Packing Densities Column */}
        <div className="md:col-span-2 space-y-3">
          <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider block">
            Simultaneous Element Packing Lanes
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Chars */}
            <div className="p-3 rounded-lg border border-[#1e293b]/40 bg-[#0c101c] flex flex-col justify-between">
              <span className="text-[10px] font-sans text-gray-500">Char (8-bit)</span>
              <div>
                <span className="text-xl font-mono font-extrabold text-indigo-400 block">{current.chars}</span>
                <span className="text-[9px] text-gray-400 leading-none">Elements / Cycle</span>
              </div>
            </div>

            {/* Integers */}
            <div className="p-3 rounded-lg border border-[#1e293b]/40 bg-[#0c101c] flex flex-col justify-between">
              <span className="text-[10px] font-sans text-gray-500">Int (32-bit)</span>
              <div>
                <span className="text-xl font-mono font-extrabold text-purple-400 block">{current.ints}</span>
                <span className="text-[9px] text-gray-400 leading-none">Elements / Cycle</span>
              </div>
            </div>

            {/* Floats */}
            <div className="p-3 rounded-lg border border-[#1e293b]/40 bg-[#0c101c] flex flex-col justify-between">
              <span className="text-[10px] font-sans text-gray-500">Float (32-bit)</span>
              <div>
                <span className="text-xl font-mono font-extrabold text-teal-400 block">{current.floats}</span>
                <span className="text-[9px] text-gray-400 leading-none">Lanes / Cycle</span>
              </div>
            </div>

            {/* Doubles */}
            <div className="p-3 rounded-lg border border-[#1e293b]/40 bg-[#0c101c] flex flex-col justify-between">
              <span className="text-[10px] font-sans text-gray-500">Double (64-bit)</span>
              <div>
                <span className="text-xl font-mono font-extrabold text-amber-400 block">{current.doubles}</span>
                <span className="text-[9px] text-gray-400 leading-none">Lanes / Cycle</span>
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-amber-500/5 border border-amber-500/10 text-[10px] text-gray-400 flex items-center gap-1.5 font-sans">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              If your loops compute <strong>floating-point matrices</strong>, compiling against <strong>AVX-512</strong> enables 16 float divisions or multiplications in parallel under a single SIMD vector instruction.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
