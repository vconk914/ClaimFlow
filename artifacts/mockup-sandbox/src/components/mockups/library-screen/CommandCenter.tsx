import React from "react";
import { Search, Image as ImageIcon, Wifi, Battery, Signal, Zap } from "lucide-react";

export function CommandCenter() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');

        .font-mono {
          font-family: 'Space Mono', monospace;
        }
        .font-sans {
          font-family: 'Inter', sans-serif;
        }

        .glow-pulse {
          animation: pulse-glow 3s infinite alternate ease-in-out;
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 10px rgba(139, 92, 246, 0.2), inset 0 0 10px rgba(139, 92, 246, 0.1); }
          100% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4), inset 0 0 20px rgba(59, 130, 246, 0.2); }
        }

        .dot-pulse {
          animation: dot-flash 1.5s infinite;
        }

        @keyframes dot-flash {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; box-shadow: 0 0 10px #ef4444; }
        }

        .node-float {
          animation: float 10s infinite ease-in-out alternate;
        }
        .node-float-2 {
          animation: float 12s infinite ease-in-out alternate-reverse;
        }
        .node-float-3 {
          animation: float 8s infinite ease-in-out alternate;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(15px, -15px); }
        }
        
        .dash-stroke {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
        }
      `}</style>

      {/* Phone Frame */}
      <div className="w-[390px] h-[844px] relative overflow-hidden rounded-[48px] border-[8px] border-gray-800 shadow-2xl bg-[#0d0d0d] font-sans flex flex-col">
        
        {/* Ambient background glow */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-20%] w-[70%] h-[40%] bg-purple-600/20 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[20%] right-[-20%] w-[60%] h-[50%] bg-blue-600/10 rounded-full blur-[100px]"></div>
        </div>

        {/* Status Bar */}
        <div className="h-[44px] w-full flex items-center justify-between px-6 pt-2 z-10 text-white/90">
          <span className="text-[15px] font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-[22px] h-[22px]" />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center px-6 pt-6 pb-24 relative z-10">
          
          <div className="w-full flex items-center justify-between mb-8">
            <h1 className="text-xl font-semibold text-white tracking-wide uppercase text-sm">System Ops</h1>
            <div className="flex items-center gap-2 bg-gray-800/60 rounded-full px-3 py-1 border border-gray-700/50">
              <div className="w-2 h-2 rounded-full bg-red-500 dot-pulse"></div>
              <span className="text-[10px] uppercase tracking-widest text-red-400 font-mono">Awaiting Data</span>
            </div>
          </div>

          {/* Network Visual */}
          <div className="relative w-full aspect-square mb-6 flex items-center justify-center">
            {/* SVG Network */}
            <svg viewBox="0 0 200 200" className="w-[120%] h-[120%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40">
              <g stroke="rgba(139, 92, 246, 0.4)" strokeWidth="0.5" fill="none">
                <path d="M100 50 L140 80 L120 130 L80 130 L60 80 Z" className="node-float" />
                <path d="M100 50 L100 100 L140 80" className="node-float-2" />
                <path d="M100 100 L120 130" className="node-float-3" />
                <path d="M100 100 L80 130" className="node-float" />
                <path d="M100 100 L60 80" className="node-float-2" />
                
                {/* Outer connections */}
                <path d="M100 20 L100 50" />
                <path d="M170 60 L140 80" />
                <path d="M160 160 L120 130" />
                <path d="M40 160 L80 130" />
                <path d="M30 60 L60 80" />
              </g>
              
              <g fill="#8b5cf6">
                <circle cx="100" cy="50" r="2" className="node-float" />
                <circle cx="140" cy="80" r="2" className="node-float-2" />
                <circle cx="120" cy="130" r="2" className="node-float-3" />
                <circle cx="80" cy="130" r="2" className="node-float" />
                <circle cx="60" cy="80" r="2" className="node-float-2" />
                <circle cx="100" cy="100" r="3" fill="#3b82f6" />
              </g>
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10 pointer-events-none">
               <Zap className="w-12 h-12 text-blue-400 mb-2 opacity-80" />
               <div className="text-3xl font-mono font-bold text-white tracking-tighter">0</div>
               <div className="text-xs text-blue-400/80 uppercase tracking-widest mt-1">Indexed Items</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 w-full mb-10">
            {[
              { label: "Photos", value: "0" },
              { label: "Tags", value: "0" },
              { label: "Scenes", value: "0" }
            ].map((stat, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm">
                {/* Mini Arc */}
                <svg className="absolute w-16 h-16 opacity-20 -rotate-90 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeDasharray="100, 100"
                  />
                </svg>
                <div className="text-xl font-mono text-white mb-1 z-10">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-wider text-gray-500 z-10">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-auto w-full flex flex-col items-center">
             <div className="text-center mb-6">
               <h2 className="text-white text-lg font-medium mb-2">Neural Core Empty</h2>
               <p className="text-gray-400 text-sm leading-relaxed px-4">
                 Upload your first images to begin training the personal recognition matrix.
               </p>
             </div>

             <button className="w-full relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl blur opacity-60 group-hover:opacity-100 transition duration-500 group-hover:duration-200"></div>
                <div className="relative w-full bg-[#0d0d0d] border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">
                  <span className="text-white font-mono uppercase tracking-widest text-sm glow-pulse">Initialize Index</span>
                </div>
             </button>
          </div>

        </div>

        {/* Tab Bar */}
        <div className="h-[83px] w-full bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 absolute bottom-0 left-0 flex items-start justify-around pt-3 pb-8 z-20">
          <button className="flex flex-col items-center gap-1.5 opacity-40">
            <Search className="w-6 h-6 text-white" />
            <span className="text-[10px] font-medium text-white">Search</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 opacity-100">
            <ImageIcon className="w-6 h-6 text-blue-400" />
            <span className="text-[10px] font-medium text-blue-400">Library</span>
          </button>
        </div>

      </div>
    </div>
  );
}
