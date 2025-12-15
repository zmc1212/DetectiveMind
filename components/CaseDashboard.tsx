import React from 'react';
import { CaseData, Suspect } from '../types';
import { MapPin, User, ChevronLeft, CheckCircle2, Lock } from 'lucide-react';

interface CaseDashboardProps {
  caseData: CaseData;
  onSelectSuspect: (suspect: Suspect) => void;
  onSolve: () => void;
  interrogatedSuspectIds: string[];
}

export const CaseDashboard: React.FC<CaseDashboardProps> = ({ 
    caseData, 
    onSelectSuspect, 
    onSolve,
    interrogatedSuspectIds 
}) => {
  
  const allInterrogated = caseData.suspects.length === interrogatedSuspectIds.length;

  const getAvatarUrl = (style?: string) => {
    if (!style) return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
    const s = style.toLowerCase();
    if (s.includes('butler')) return 'https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80';
    if (s.includes('lady')) return 'https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80';
    if (s.includes('driver')) return 'https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80';
    return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 animate-fade-in pb-20">
      {/* Header / Scene Banner */}
      <div className="relative w-full h-80 md:h-96 overflow-hidden border-b border-red-900/30">
        <img 
            src="https://img.freepik.com/free-photo/vintage-room-interior-with-old-books-scrolls_23-2149429415.jpg?t=st=1738596000~exp=1738599600~hmac=e2c9e7a8f1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1" 
            alt="Crime Scene" 
            className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-8 max-w-4xl">
           <div className="flex items-center gap-2 text-red-500 font-bold tracking-widest text-xs uppercase mb-2">
             <MapPin size={14} />
             Crime Scene
           </div>
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 shadow-black drop-shadow-md">
             {caseData.title}
           </h1>
           <div className="flex gap-4 mb-4 text-xs font-mono text-slate-400">
             <span className="bg-red-950/50 px-2 py-1 rounded border border-red-900/50">死者: 李老爷</span>
             <span className="bg-slate-800/50 px-2 py-1 rounded border border-slate-700">死因: 头部钝器重击</span>
           </div>
           <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl bg-black/40 p-4 rounded-lg backdrop-blur-sm border-l-2 border-red-600">
             {caseData.introduction}
           </p>
        </div>
      </div>

      {/* Suspects List */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-slate-400 mb-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
             <User size={20} /> 嫌疑人名单 (点击进行审讯)
           </div>
           <div className="text-sm font-normal text-slate-500">
              审讯进度: <span className={allInterrogated ? "text-green-500" : "text-amber-500"}>{interrogatedSuspectIds.length}/{caseData.suspects.length}</span>
           </div>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caseData.suspects.map((suspect) => {
            const isInterrogated = interrogatedSuspectIds.includes(suspect.id);
            return (
                <div 
                  key={suspect.id}
                  onClick={() => onSelectSuspect(suspect)}
                  className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:transform hover:-translate-y-1 shadow-lg relative"
                >
                  {/* Status Badge */}
                  {isInterrogated && (
                      <div className="absolute top-3 right-3 z-20 bg-green-900/80 text-green-400 px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm border border-green-700/50 shadow-lg">
                          <CheckCircle2 size={14} />
                          <span className="text-xs font-bold">已审讯</span>
                      </div>
                  )}

                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={getAvatarUrl(suspect.avatarStyle)} 
                      alt={suspect.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isInterrogated ? 'grayscale-[0.5]' : 'grayscale'} group-hover:scale-110 group-hover:grayscale-0`}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h3 className="text-2xl font-serif font-bold text-white">{suspect.name}</h3>
                      <span className="text-red-500 text-xs uppercase tracking-wider font-bold">{suspect.role}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-slate-400 text-sm leading-relaxed min-h-[3rem]">
                      {suspect.description}
                    </p>
                  </div>
                </div>
            );
          })}
        </div>
      </div>
      
      {/* Solve Button Fixed Bottom */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#0f172a]/95 backdrop-blur border-t border-slate-800 flex justify-center z-50">
         {allInterrogated ? (
             <button 
               onClick={onSolve}
               className="bg-red-800 hover:bg-red-700 text-slate-100 px-8 py-3 rounded-lg font-bold border border-red-600 transition-all w-full max-w-md shadow-[0_0_20px_rgba(185,28,28,0.4)] animate-pulse hover:animate-none flex items-center justify-center gap-2"
             >
               指认凶手 (提交报告)
             </button>
         ) : (
             <div className="bg-slate-900 text-slate-500 px-8 py-3 rounded-lg font-bold border border-slate-700 w-full max-w-md flex items-center justify-center gap-2 cursor-not-allowed opacity-80">
                 <Lock size={16} />
                 <span>请先完成所有审讯 ({interrogatedSuspectIds.length}/{caseData.suspects.length})</span>
             </div>
         )}
      </div>
    </div>
  );
};