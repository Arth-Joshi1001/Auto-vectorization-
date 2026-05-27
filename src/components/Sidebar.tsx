import React from "react";
import { 
  LayoutDashboard, 
  Code, 
  Layers, 
  BarChart3, 
  Info, 
  Cpu, 
  Zap,
  HelpCircle,
  FileCode
} from "lucide-react";
import { SidebarTab } from "../types";

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "Overview & Analytics" },
    { id: "editor", label: "Code Editor", icon: Code, desc: "C/C++ Source Editor" },
    { id: "performance", label: "Performance", icon: BarChart3, desc: "Speedup & Metrics" },
    { id: "about", label: "Compiler Insights", icon: Info, desc: "SIMD Core Theory" },
  ] as const;

  return (
    <div className="w-64 bg-[#0a0d16] border-r border-[#1e293b]/70 flex flex-col justify-between h-full p-4 select-none">
      {/* Upper Logo / Title Section */}
      <div className="space-y-8">
        <div id="sidebar-logo" className="flex items-center gap-2 px-2 mt-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <div className="w-full h-full rounded-[6px] bg-[#0d0e15] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-gray-100 uppercase">
              Auto Vectorize
            </h1>
            <p className="text-[10px] text-indigo-400 font-mono">ST COMPILER ENGINE</p>
          </div>
        </div>

        {/* Menu Navigation Items */}
        <nav className="space-y-1.5" id="sidebar-nav">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-left transition-all duration-300 relative group ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500 font-medium" 
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#151c2c]/50 border-l-2 border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
                <div className="flex-1">
                  <div className="text-[13px] leading-tight font-sans">{item.label}</div>
                  <div className={`text-[9px] leading-none mt-0.5 font-sans ${isActive ? "text-indigo-400/80" : "text-gray-500 group-hover:text-gray-400"}`}>
                    {item.desc}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Info */}
      <div className="mt-auto px-2 pt-4 border-t border-[#1e293b]/40">
        <div className="flex items-center gap-1.5 p-2 bg-[#121824] rounded-lg">
          <HelpCircle className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-[11px] text-gray-400 font-sans leading-none">LLVM 18.2 Platform</span>
        </div>
      </div>
    </div>
  );
}
