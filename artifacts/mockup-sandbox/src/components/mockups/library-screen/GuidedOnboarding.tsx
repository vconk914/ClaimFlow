import React, { useState } from 'react';
import { 
  Battery, 
  Wifi, 
  Signal, 
  Search, 
  Image as ImageIcon, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2,
  Images
} from 'lucide-react';

export function GuidedOnboarding() {
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .pulse-soft {
          animation: pulseSoft 2s infinite;
        }
        
        @keyframes pulseSoft {
          0% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(0, 113, 227, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 113, 227, 0); }
        }
      `}</style>

      {/* Phone Frame */}
      <div className="w-[390px] h-[844px] relative overflow-hidden rounded-[48px] border-[8px] border-gray-800 shadow-2xl bg-[#F2F2F7]">
        
        {/* Status Bar */}
        <div className="h-[44px] w-full flex items-center justify-between px-6 pt-2 z-50 relative bg-[#F2F2F7]/80 backdrop-blur-md">
          <div className="text-[15px] font-semibold text-black tracking-tight">9:41</div>
          <div className="flex items-center gap-1.5">
            <Signal size={16} fill="black" strokeWidth={0} />
            <Wifi size={16} fill="black" strokeWidth={0} />
            <Battery size={24} fill="black" strokeWidth={0} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 h-[calc(100%-44px-83px)] overflow-y-auto pb-6">
          
          {/* Header */}
          <div className="px-6 pt-4 pb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Library</h1>
          </div>

          {/* Wizard Progress */}
          <div className="px-6 py-6 mb-2 fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>
              
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2 bg-[#F2F2F7] px-1">
                <div className="w-8 h-8 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  1
                </div>
                <span className="text-[11px] font-medium text-[#0071e3]">Select</span>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2 bg-[#F2F2F7] px-1">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <span className="text-[11px] font-medium text-gray-400">Analyze</span>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2 bg-[#F2F2F7] px-1">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-400 flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <span className="text-[11px] font-medium text-gray-400">Search</span>
              </div>
            </div>
          </div>

          {/* Main Card */}
          <div className="px-6 fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>
              
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 relative">
                <Images className="w-10 h-10 text-[#0071e3]" strokeWidth={1.5} />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Let's get you started</h2>
              <p className="text-[#8e8e93] text-[15px] leading-relaxed mb-8 px-2">
                Select your favorite photos to create your smart, searchable library.
              </p>
              
              <button className="w-full bg-[#0071e3] text-white rounded-2xl py-4 font-semibold text-[17px] shadow-sm flex items-center justify-center gap-2 hover:bg-[#0071e3]/90 transition-colors active:scale-[0.98] pulse-soft">
                <PlusCircle className="w-5 h-5" />
                Choose Photos to Index
              </button>
            </div>
          </div>

          {/* How it works */}
          <div className="px-6 mt-6 mb-8 fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <button 
                onClick={() => setIsHowItWorksOpen(!isHowItWorksOpen)}
                className="w-full flex items-center justify-between p-4 bg-white active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-medium text-gray-700">How it works</span>
                </div>
                {isHowItWorksOpen ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isHowItWorksOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 space-y-4 border-t border-gray-50 bg-gray-50/50">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0071e3] mt-0.5 shrink-0" />
                    <p className="text-[14px] text-gray-600 leading-snug">Choose the photos you want to make searchable.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0071e3] mt-0.5 shrink-0" />
                    <p className="text-[14px] text-gray-600 leading-snug">Our AI securely analyzes what's in each photo.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#0071e3] mt-0.5 shrink-0" />
                    <p className="text-[14px] text-gray-600 leading-snug">Find any photo instantly by typing what you remember.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Tab Bar */}
        <div className="absolute bottom-0 w-full h-[83px] bg-[#F2F2F7]/90 backdrop-blur-xl border-t border-gray-200/50 flex items-start justify-around pt-3 pb-8 px-6">
          <button className="flex flex-col items-center gap-1.5 opacity-40">
            <Search size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium tracking-wide">Search</span>
          </button>
          
          <button className="flex flex-col items-center gap-1.5 text-[#0071e3]">
            <ImageIcon size={24} strokeWidth={2.5} fill="currentColor" className="opacity-20 absolute" />
            <ImageIcon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium tracking-wide">Library</span>
          </button>
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-full z-50"></div>
      </div>
    </div>
  );
}
