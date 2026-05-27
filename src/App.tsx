import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Upload, 
  Download, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  BarChart3, 
  Sparkles, 
  Info, 
  CheckCircle,
  HelpCircle
} from "lucide-react";
import MonacoEditor from "@monaco-editor/react";

import Sidebar from "./components/Sidebar";
import AnalysisSummaryCard from "./components/AnalysisSummaryCard";
import PerformanceCharts from "./components/PerformanceCharts";
import CodeTransformationView from "./components/CodeTransformationView";
import { SidebarTab, AnalysisResult } from "./types";

const INITIAL_CODE = `#include <stdio.h>
#define N 1024

void add(int *a, int *b, int *c) {
    int i;
    for (i = 0; i < N; i++) {
        c[i] = a[i] + b[i];
    }
}

int main() {
    return 0;
}`;

export default function App() {
  const [activeTab, setActiveTab] = useState<SidebarTab>("dashboard");
  const [sourceCode, setSourceCode] = useState<string>(INITIAL_CODE);
  const [selectedPreset, setSelectedPreset] = useState<string>("vec_add");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [presets, setPresets] = useState<Record<string, any>>({});
  
  // Default analysis matching VecAdd
  const [analysis, setAnalysis] = useState<AnalysisResult>({
    is_vectorizable: true,
    data_dependency: "None (Zero Loop-Carried Dependencies)",
    memory_access: "Sequential / Unit-Stride (100% Contiguous)",
    simd_width: 4,
    loop_type: "Countable Parallel Loop",
    induction_var: "i",
    trip_count: "1024",
    vectorizable_lines: [6, 7, 8],
    non_vectorizable_lines: [],
    reasons: ["Array accesses a[i], b[i], and c[i] are perfectly isolated between loop iterations. Safe to execute simultaneously via 128-bit SIMD registers."],
    transformed_code_scalar: `for (int i = 0; i < 1024; i++) {\n    c[i] = a[i] + b[i];\n}`,
    transformed_code_vector: `// SIMD Step: Process 4 elements at once, matching 128-bit hardware lanes\nfor (int i = 0; i < 1024; i += 4) {\n    c[i + 0] = a[i + 0] + b[i + 0]; // Lane 0\n    c[i + 1] = a[i + 1] + b[i + 1]; // Lane 1\n    c[i + 2] = a[i + 2] + b[i + 2]; // Lane 2\n    c[i + 3] = a[i + 3] + b[i + 3]; // Lane 3\n}`,
    compiler_logs: [
      "vec_add.c:6: note: loop vectorized with SIMD width 4",
      "vec_add.c:7: note: vector alignment resolved using unaligned loads (_mm_loadu_si128)",
      "vec_add.c:6: note: Speedup multiplier estimate: 4.0x (Optimal SIMD utilization)"
    ],
    speedup: {
      scalar_time: 18.75,
      vector_time: 4.32,
      ratio: "4.34x"
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch presets from the Node.js API
  useEffect(() => {
    fetch("/api/presets")
      .then((res) => res.json())
      .then((data) => {
        setPresets(data);
      })
      .catch((err) => {
        console.error("Could not fetch presets:", err);
      });
  }, []);

  // Update editor text when preset changes
  const handlePresetChange = (key: string) => {
    setSelectedPreset(key);
    if (presets[key]) {
      setSourceCode(presets[key].code);
      setAnalysis(presets[key].analysis);
    } else {
      // Static client-side fallbacks if fetch fails
      const backupPresets: Record<string, any> = {
        vec_add: {
          code: INITIAL_CODE,
          analysis: {
            is_vectorizable: true,
            data_dependency: "None (Zero Loop-Carried Dependencies)",
            memory_access: "Sequential / Unit-Stride (100% Contiguous)",
            simd_width: 4,
            loop_type: "Countable Parallel Loop",
            induction_var: "i",
            trip_count: "1024",
            vectorizable_lines: [6, 7, 8],
            non_vectorizable_lines: [],
            reasons: ["Array accesses a[i], b[i], and c[i] are perfectly isolated between loop iterations. Safe to execute simultaneously via 128-bit SIMD registers."],
            transformed_code_scalar: `for (int i = 0; i < 1024; i++) {\n    c[i] = a[i] + b[i];\n}`,
            transformed_code_vector: `// SIMD Step: Process 4 elements at once, matching 128-bit hardware lanes\nfor (int i = 0; i < 1024; i += 4) {\n    c[i + 0] = a[i + 0] + b[i + 0]; // Lane 0\n    c[i + 1] = a[i + 1] + b[i + 1]; // Lane 1\n    c[i + 2] = a[i + 2] + b[i + 2]; // Lane 2\n    c[i + 3] = a[i + 3] + b[i + 3]; // Lane 3\n}`,
            compiler_logs: [
              "vec_add.c:6: note: loop vectorized with SIMD width 4",
              "vec_add.c:7: note: vector alignment resolved using unaligned loads (_mm_loadu_si128)",
              "vec_add.c:6: note: Speedup multiplier estimate: 4.0x (Optimal SIMD utilization)"
            ],
            speedup: { scalar_time: 18.75, vector_time: 4.32, ratio: "4.34x" }
          }
        }
      };
      if (backupPresets[key]) {
        setSourceCode(backupPresets[key].code);
        setAnalysis(backupPresets[key].analysis);
      }
    }
  };

  // Perform backend auto-vectorization analysis
  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: sourceCode, presetKey: selectedPreset })
      });
      const data = await response.json();
      
      // Adapt variables that might differ in naming
      const finalResult: AnalysisResult = {
        is_vectorizable: data.is_vectorizable,
        data_dependency: data.data_dependency || "None",
        memory_access: data.memory_access || "Sequential",
        simd_width: data.simd_width || 4,
        loop_type: data.loop_type || "Countable Loop",
        induction_var: data.induction_var || "i",
        trip_count: data.trip_count || "Unknown",
        vectorizable_lines: data.vectorizable_lines || [],
        non_vectorizable_lines: data.non_vectorizable_lines || [],
        reasons: data.reasons || ["Completed standard loop evaluation."],
        transformed_code_scalar: data.transformed_code_scalar || sourceCode,
        transformed_code_vector: data.transformed_code_vector || "Completed analysis",
        compiler_logs: data.compiler_logs || ["[INFO] Diagnostic log retired."],
        speedup: data.speedup || { scalar_time: 10, vector_time: 5, ratio: "2.00x" }
      };

      setAnalysis(finalResult);
    } catch (err) {
      console.error("Vectorization analysis call failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle local C file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setSourceCode(text);
        setSelectedPreset("custom");
      }
    };
    reader.readAsText(file);
  };

  // Trigger C file Download
  const handleDownloadCode = () => {
    const blob = new Blob([sourceCode], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "source_vector_module.c";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Optimized Vector C code
  const handleDownloadOptimized = () => {
    const blob = new Blob([analysis.transformed_code_vector], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "optimized_simd_module.c";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export educational analysis report as formatted Markdown text
  const handleExportReport = () => {
    const reportText = `===========================================
COMPILER VECTORIZATION REPORT
===========================================
Project: Auto Vectorization in Compiler
Induction Variable: "${analysis.induction_var}"
Trip Counter: ${analysis.trip_count}
Vectorization Status: ${analysis.is_vectorizable ? "ELIGIBLE FOR SIMD" : "INELIGIBLE"}
Estimated Speedup: ${analysis.speedup.ratio}

--- REASONS & DIAGNOSTICS ---
${analysis.reasons.map((r, i) => `${i + 1}. ${r}`).join("\n")}

--- COMPILER DIAGNOSIS REMARKS ---
${analysis.compiler_logs.join("\n")}
`;
    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vector_compiler_report.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Annotated C Code line renderer with line highlight matching VTune style!
  const renderAnnotatedCode = () => {
    const lines = sourceCode.split("\n");
    const vecLines = analysis.vectorizable_lines || [];
    const nonVecLines = analysis.non_vectorizable_lines || [];

    return (
      <div className="font-mono text-xs overflow-y-auto max-h-[350px] p-4 rounded-lg bg-[#070a13] border border-[#1e293b]/60 relative select-text">
        {lines.map((line, idx) => {
          const lineNum = idx + 1;
          const isVec = vecLines.includes(lineNum);
          const isNonVec = nonVecLines.includes(lineNum);

          let bgClass = "hover:bg-[#101423]/40";
          let markerClass = "border-transparent";
          let labelText = "";

          if (isVec) {
            bgClass = "bg-emerald-500/10 hover:bg-emerald-500/15";
            markerClass = "border-emerald-500";
            labelText = "Vectorizable";
          } else if (isNonVec) {
            bgClass = "bg-rose-500/10 hover:bg-rose-500/15";
            markerClass = "border-rose-500";
            labelText = "Dependency Constraint";
          }

          return (
            <div key={idx} className={`flex items-stretch border-l-2 ${markerClass} ${bgClass} py-0.5`}>
              {/* Line number */}
              <span className="w-10 text-right text-gray-500 pr-3 select-none text-[10px] sm:text-xs">
                {lineNum}
              </span>
              {/* Line content */}
              <span className={`flex-1 pr-4 whitespace-pre ${
                isVec ? "text-emerald-300 font-medium" : isNonVec ? "text-rose-300" : "text-gray-300"
              }`}>
                {line || " "}
              </span>
              {/* Vector label tag */}
              {labelText && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded leading-none text-right flex items-center select-none mr-2 font-sans ${
                  isVec ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}>
                  {labelText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#060810] text-[#cbd5e1] overflow-hidden font-sans">
      
      {/* Sidebar navigation drawer */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Upper Header Toolbars */}
        <header className="h-16 border-b border-[#1e293b]/70 bg-[#070b13] flex items-center justify-between px-6 shrink-0 relative z-20">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-gray-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400 animate-spin-slow" />
                Auto Vectorization compiler inspector
              </h2>
              <p className="text-[10px] text-indigo-400/90 font-mono mt-0.5">
                TARGET INTEL AVX-2 PLATFORM (128-BIT PACKED CORES)
              </p>
            </div>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-3">
            {/* Source Preset Dropdown */}
            <select
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-[#0f1424] border border-[#1e293b] text-gray-300 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer font-sans"
            >
              <option value="vec_add">Preset: Vector Addition (c[i] = a[i] + b[i])</option>
              <option value="fibonacci">Preset: Fibonacci Sequence (RAW dependency)</option>
              <option value="conditional_masking">Preset: Conditional Masking (a[i] &gt; 0)</option>
              <option value="pointer_chasing">Preset: Pointer Chasing (Linked List)</option>
              <option value="matrix_mul">Preset: Strided / Column access (Matrix multiplication)</option>
              <option value="custom">Custom Entered Source</option>
            </select>

            {/* Custom file upload interface */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".c,.cpp,.h"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded border border-[#1e293b]/80 bg-[#0f1424] hover:bg-[#151c2c] text-gray-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Upload custom C program file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-sans">Upload C</span>
            </button>

            {/* Run Analysis glowing button */}
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-1.5 rounded bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" /> Analyze Code
                </>
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-[#060810] to-[#04050b]" id="main-content-scroll">
          
          {/* Page Title & Navigation Header Indicator */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold font-sans text-gray-200 capitalize flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 inline-block shrink-0 animate-pulse" />
              Compiler Core :: {activeTab}
            </h1>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
              <span>SYSTEM STATE: ACTIVE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            </div>
          </div>

          {/* DASHBOARD TAB VIEW */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Loop detection and eligibility overview cards */}
              <AnalysisSummaryCard analysis={analysis} />

              {/* Dynamic comparison code block & marked analyzer (VTune view) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Editor Preview */}
                <div className="p-4 rounded-xl border border-[#1e293b]/80 bg-[#0c101c]/80 backdrop-blur-md flex flex-col justify-between">
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-sans">
                        C Source Code Editor
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400">VS Code Theme</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-sans leading-normal">
                      Write or edit your custom iteration loop directly inside this interactive block
                    </p>
                  </div>
                  
                  {/* Monaco Editor Container */}
                  <div className="rounded-lg border border-[#1e293b]/50 overflow-hidden mb-4">
                    <MonacoEditor
                      height="200px"
                      language="cpp"
                      theme="vs-dark"
                      value={sourceCode}
                      onChange={(val) => {
                        if (val) {
                          setSourceCode(val);
                          setSelectedPreset("custom");
                        }
                      }}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 12,
                        lineNumbers: "on",
                        tabSize: 4
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1e293b]/20">
                    <button
                      onClick={handleDownloadCode}
                      className="px-2.5 py-1.5 rounded border border-[#1e293b] text-gray-400 hover:text-gray-200 text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Source
                    </button>
                    <button
                      onClick={runAnalysis}
                      className="px-3 py-1.5 rounded bg-indigo-600/35 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze Live
                    </button>
                  </div>
                </div>

                {/* Line Annotated Inspector view (Right column) */}
                <div className="p-4 rounded-xl border border-[#1e293b]/80 bg-[#0c101c]/80 backdrop-blur-md flex flex-col justify-between">
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-sans">
                        Auto Vectorization Analysis : Inspector
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">Vector Line Check</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-sans leading-normal">
                      Highlight vectorizable loops in <strong className="text-emerald-400">Green</strong>, and dependency/non-vectorizable statements in <strong className="text-rose-400">Red</strong>
                    </p>
                  </div>

                  {renderAnnotatedCode()}

                  <div className="flex justify-between items-center pt-4 border-t border-[#1e293b]/20 text-[10px] font-mono mt-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/20 border border-emerald-500/50" /> Vectorizable</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-500/20 border border-rose-500/50" /> Dependency Target</span>
                    </div>
                    <div className="text-gray-500">LLVM Diagnostic</div>
                  </div>
                </div>
              </div>

              {/* Code Level SIMD Transformation */}
              <CodeTransformationView 
                scalarCode={analysis.transformed_code_scalar}
                vectorCode={analysis.transformed_code_vector}
                isVectorizable={analysis.is_vectorizable}
              />

              {/* Native Double column plots comparison */}
              <PerformanceCharts speedup={analysis.speedup} />

            </div>
          )}

          {/* CODE EDITOR WORKSPACE VIEW */}
          {activeTab === "editor" && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-[#1e293b]/80 bg-[#0c101c]/80 backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e293b]/40 pb-4 mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider font-sans flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      Senior Level Compiler Playground
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                      Type, customize, compile or parse standard C loop optimization files
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadCode}
                      className="px-3 py-1.5 rounded border border-[#1e293b] hover:bg-[#151c2c] text-gray-300 text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Source (.c)
                    </button>
                    <button
                      onClick={runAnalysis}
                      className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-sans font-bold text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" /> Compile & Analyze
                    </button>
                  </div>
                </div>

                {/* Main large IDE workspace */}
                <div className="rounded-lg border border-[#1e293b]/70 overflow-hidden">
                  <MonacoEditor
                    height="320px"
                    language="cpp"
                    theme="vs-dark"
                    value={sourceCode}
                    onChange={(val) => {
                      if (val) {
                        setSourceCode(val);
                        setSelectedPreset("custom");
                      }
                    }}
                    options={{
                      minimap: { enabled: true },
                      scrollBeyondLastLine: false,
                      fontSize: 13,
                      lineNumbers: "on",
                      padding: { top: 10 }
                    }}
                  />
                </div>
              </div>

              {/* Marked inspector block mirroring editor highlights */}
              <div className="p-4 rounded-xl border border-[#1e293b]/80 bg-[#0c101c]/80 backdrop-blur-md space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-sans">
                    Live Annotated Iteration Statement Inspector
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                    Interactive line trace output comparing loop unrolled targets
                  </p>
                </div>

                {renderAnnotatedCode()}
              </div>
            </div>
          )}



          {/* PERFORMANCE GRAPHS VIEW */}
          {activeTab === "performance" && (
            <div className="space-y-6">
              
              {/* Primary Bar comparisons */}
              <PerformanceCharts speedup={analysis.speedup} />

              {/* Additional custom speedup simulator inputs */}
              <div className="p-5 rounded-xl border border-[#1e293b]/80 bg-[#0c101c]/80 backdrop-blur-md">
                <div className="border-b border-[#1e293b]/40 pb-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider font-sans flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    SIMD Target Hardware Emulator Sandbox
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                    Fiddle with hardware vector sizes to evaluate microarchitecture speed profiles
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-3.5 p-4 rounded bg-black/40 border border-[#1e293b]/40 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-indigo-400 uppercase font-semibold block">SSE SIMD Unit (128-bit)</span>
                      <p className="text-[11px] text-gray-400 mt-1 font-sans">Recommended fallback layout matching legacy x86 processing cores.</p>
                    </div>
                    <div className="text-sm font-mono font-bold text-gray-200 pt-2 border-t border-[#1e293b]/30">
                      Est. Multiplier: ~3.8x - 4.2x
                    </div>
                  </div>

                  <div className="space-y-3.5 p-4 rounded bg-indigo-500/5 border border-indigo-500/30 flex flex-col justify-between shadow-[0_0_12px_rgba(99,102,241,0.1)]">
                    <div>
                      <span className="text-xs font-mono text-purple-400 uppercase font-semibold block">AVX2 Register Unit (256-bit)</span>
                      <p className="text-[11px] text-gray-400 mt-1 font-sans">Modern server processors. Processes eight float elements in parallel pipelines.</p>
                    </div>
                    <div className="text-sm font-mono font-bold text-indigo-400 pt-2 border-t border-[#1e293b]/30">
                      Est. Multiplier: ~6.2x - 8.0x
                    </div>
                  </div>

                  <div className="space-y-3.5 p-4 rounded bg-black/40 border border-[#1e293b]/40 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-emerald-400 uppercase font-semibold block">AVX-512 Xeon (512-bit)</span>
                      <p className="text-[11px] text-gray-400 mt-1 font-sans">Heavy high-performance scientific matrix calculations. Supports masked control lanes.</p>
                    </div>
                    <div className="text-sm font-mono font-bold text-emerald-400 pt-2 border-t border-[#1e293b]/30">
                      Est. Multiplier: ~10.4x - 14.5x
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* COMPILER INSIGHTS VIEW */}
          {activeTab === "about" && (
            <div className="space-y-6">
              
              {/* Detailed Compiler auto-vectorization theory */}
              <div className="p-5 rounded-xl border border-[#1e293b]/80 bg-[#0c101c]/80 backdrop-blur-md space-y-4">
                <div className="border-b border-[#1e293b]/40 pb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-gray-200 uppercase tracking-wider font-sans">
                    Educational Compiler Insights & Core SIMD Theory
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300 leading-relaxed">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono">
                      Q1: What is Auto-Vectorization?
                    </h4>
                    <p className="font-sans">
                      Auto-vectorization is an advanced optimization pass conducted by compilers (like LLVM/Clang or GCC) that detects sequential loops executing calculations one element at a time, and translates them into equivalent parallel operations using <strong>SIMD (Single Instruction Multiple Data)</strong> assembly commands.
                    </p>
                    
                    <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono">
                      Q2: Why did my compiler bypass auto-vectorization?
                    </h4>
                    <p className="font-sans">
                      The most common obstacle is **Data Dependencies** across iterations (Loop-carried dependencies). If calculating index <code>i</code> expects values stored during iteration <code>i-1</code>, the loop cannot resolve parallel computations correctly. Other blockers include early exit conditions (pointer loops, uncountable breaks) and unaligned memory strides.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-purple-400 uppercase font-mono">
                      Q3: Understanding Dependency Testing (GCD / Distance)
                    </h4>
                    <p className="font-sans">
                      Compiler architectures solve mathematical formulations to prove loop safety. A classic model uses the **Greatest Common Divisor (GCD)** analysis. If you have index accesses <code>A[a*i + b]</code> and <code>A[c*i + d]</code>, and the GCD of coefficients <code>a</code> and <code>c</code> doesn't divide the absolute gap of displacements <code>|d - b|</code>, then no memory overlap is logically possible, rendering loop vectorization safe.
                    </p>
                    
                    <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono border-t border-[#1e293b]/40 pt-3">
                      Demonstrated C++ & Python Modules:
                    </h4>
                    <p className="font-sans flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                      Python loop dependency tracker: <code>compiler/analyzer.py</code>
                    </p>
                    <p className="font-sans flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                      C++ GCD & Distance calculation module: <code>compiler/analyzer.cpp</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive buttons to download analyzed codes */}
              <div className="p-5 rounded-xl border border-[#1e293b]/80 bg-[#070b13] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-200 uppercase tracking-wider font-sans">
                    Download SIMD Module Templates
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-1 font-sans">
                    Integrate optimized vectors directly into your workstation C project pipelines
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadCode}
                    className="px-3 py-1.5 rounded border border-[#1e293b] hover:bg-[#151c2c] text-gray-300 text-xs font-sans flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Source Code
                  </button>
                  <button
                    onClick={handleDownloadOptimized}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-sans font-bold text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Optimized Target Code
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
