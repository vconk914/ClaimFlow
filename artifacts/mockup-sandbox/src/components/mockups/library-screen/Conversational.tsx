import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, Search, Image as ImageIcon, Plus, ArrowUp } from 'lucide-react';

export function Conversational() {
  const [showSecondMessage, setShowSecondMessage] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowTyping(true), 1500);
    const timer2 = setTimeout(() => {
      setShowTyping(false);
      setShowSecondMessage(true);
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 font-sans p-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .mockup-font {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 0.4; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .dot-1 { animation: pulseDot 1.4s infinite ease-in-out both; }
        .dot-2 { animation: pulseDot 1.4s infinite ease-in-out both 0.2s; }
        .dot-3 { animation: pulseDot 1.4s infinite ease-in-out both 0.4s; }
      `}</style>

      {/* Phone Frame */}
      <div className="w-[390px] h-[844px] relative overflow-hidden rounded-[48px] border-[8px] border-gray-900 shadow-2xl bg-[#F9F9FB] mockup-font flex flex-col">
        
        {/* Status Bar */}
        <div className="h-[44px] w-full flex items-center justify-between px-6 z-10 shrink-0">
          <span className="text-[15px] font-semibold tracking-tight text-gray-900">9:41</span>
          <div className="flex items-center gap-2 text-gray-900">
            <Signal size={16} strokeWidth={2.5} />
            <Wifi size={16} strokeWidth={2.5} />
            <Battery size={24} strokeWidth={2} />
          </div>
        </div>

        {/* Header */}
        <div className="px-4 py-3 bg-[#F9F9FB]/80 backdrop-blur-md border-b border-gray-200/50 flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl shadow-sm">
            🤖
          </div>
          <div>
            <h1 className="text-[17px] font-semibold text-gray-900 leading-tight">PhotoAI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-[13px] text-gray-500 font-medium">Online</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4">
          <div className="text-center mb-2">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-full">
              Today
            </span>
          </div>

          {/* First Message */}
          <div className="flex gap-2.5 animate-fade-in max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shrink-0 shadow-sm mt-auto mb-1">
              🤖
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100/50">
              <p className="text-[15px] text-gray-800 leading-relaxed">
                Hey! I'm ready to learn your photo collection. Add some photos and I'll read every image — people, places, moments, food, anything — so you can find them by describing them in words. 📸✨
              </p>
            </div>
          </div>

          {/* Typing Indicator */}
          {showTyping && (
            <div className="flex gap-2.5 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shrink-0 mt-auto mb-1">
                🤖
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100/50 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full dot-1"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full dot-2"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full dot-3"></div>
              </div>
            </div>
          )}

          {/* Second Message */}
          {showSecondMessage && (
            <div className="flex flex-col gap-4 animate-fade-in max-w-[85%] ml-10">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100/50">
                <p className="text-[15px] text-gray-800 leading-relaxed">
                  I'll analyze up to 50 photos at a time. The more you add, the smarter I get. What should we start with?
                </p>
              </div>
              
              {/* Quick Replies */}
              <div className="flex flex-wrap gap-2 mt-2">
                <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-[14px] font-medium transition-colors border border-blue-100/50 flex items-center gap-1.5">
                  <Plus size={16} />
                  Add 10 photos
                </button>
                <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-[14px] font-medium transition-colors border border-blue-100/50 flex items-center gap-1.5">
                  <Plus size={16} />
                  Add 25 photos
                </button>
                <button className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-[14px] font-medium transition-colors border border-blue-100/50 flex items-center gap-1.5">
                  <Plus size={16} />
                  Add 50 photos
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200/60 px-4 py-3 pb-safe shrink-0">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex flex-shrink-0 items-center justify-center text-gray-400 hover:text-blue-500 transition-colors bg-gray-50 rounded-full border border-gray-100">
              <Plus size={22} strokeWidth={2} />
            </button>
            <div className="flex-1 bg-gray-100 h-10 rounded-full px-4 flex items-center">
              <span className="text-gray-400 text-[15px]">Choose photos to add...</span>
            </div>
            <button className="w-10 h-10 flex flex-shrink-0 items-center justify-center bg-blue-500 text-white rounded-full shadow-sm hover:bg-blue-600 transition-colors">
              <ArrowUp size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Bottom Tab Bar */}
        <div className="h-[83px] bg-white border-t border-gray-200 flex pb-6 px-6 shrink-0 relative">
          <div className="flex-1 flex flex-col items-center justify-center gap-1 pt-2 text-gray-400 cursor-pointer">
            <Search size={24} strokeWidth={2} />
            <span className="text-[10px] font-medium">Search</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-1 pt-2 text-blue-500 cursor-pointer">
            <ImageIcon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium">Library</span>
          </div>
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-full z-20"></div>
      </div>
    </div>
  );
}
