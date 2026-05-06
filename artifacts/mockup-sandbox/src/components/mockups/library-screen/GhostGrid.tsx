import React from "react";
import { Search, Image as ImageIcon, Plus, Wifi, Battery, Signal, Sparkles } from "lucide-react";

export function GhostGrid() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-900 font-sans p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
          background: linear-gradient(to right, #f0f0f0 4%, #f8f8f8 25%, #f0f0f0 36%);
          background-size: 1000px 100%;
        }
      `}</style>
      
      {/* Phone Frame */}
      <div className="w-[390px] h-[844px] relative overflow-hidden rounded-[48px] border-[12px] border-neutral-800 shadow-2xl bg-white font-jakarta flex flex-col">
        
        {/* Status Bar */}
        <div className="h-[44px] flex items-center justify-between px-6 pt-2 z-20 bg-white/80 backdrop-blur-md absolute top-0 left-0 right-0">
          <span className="text-[15px] font-semibold text-neutral-900">9:41</span>
          <div className="flex items-center gap-1.5 text-neutral-900">
            <Signal size={16} strokeWidth={2.5} />
            <Wifi size={16} strokeWidth={2.5} />
            <Battery size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Dynamic Island fake */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[32px] bg-black rounded-full z-30" />

        {/* Main Content Area */}
        <div className="flex-1 relative pt-[44px] pb-[83px] bg-white overflow-hidden">
          
          {/* Header */}
          <div className="px-5 pt-8 pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Library</h1>
          </div>

          {/* Ghost Grid */}
          <div className="px-1 grid grid-cols-3 gap-1 overflow-hidden h-[800px]">
            {/* Generate some ghost items */}
            {Array.from({ length: 24 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-square bg-[#e8e8e8] animate-shimmer"
                style={{ 
                  animationDelay: `${(i % 5) * 0.15}s`,
                  opacity: Math.max(0.1, 1 - (Math.floor(i / 3) * 0.1))
                }}
              />
            ))}
          </div>

          {/* Floating Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-[0_16px_40px_rgba(0,0,0,0.1)] rounded-3xl p-8 mx-6 flex flex-col items-center text-center max-w-[300px] pointer-events-auto mt-[-100px]">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                <Sparkles size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">Your library is empty</h2>
              <p className="text-neutral-500 text-sm leading-relaxed mb-4">
                Our AI indexes your photos so you can search them naturally.
              </p>
              <p className="text-neutral-900 text-sm font-semibold">
                Add photos to fill your grid.
              </p>
            </div>
          </div>

          {/* FAB - Add Photos */}
          <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
            <button className="w-16 h-16 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(37,99,235,0.4)] text-white group cursor-pointer">
              <Plus size={32} className="group-hover:scale-110 transition-transform duration-200" />
            </button>
          </div>

        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-white border-t border-neutral-100 flex justify-around items-start pt-3 z-20 pb-safe">
          <div className="flex flex-col items-center gap-1 opacity-40">
            <Search size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium">Search</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-blue-600">
            <ImageIcon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Library</span>
          </div>
        </div>
      </div>
    </div>
  );
}
