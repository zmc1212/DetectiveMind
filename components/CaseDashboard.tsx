import React from 'react';
import { CaseData, Suspect } from '../types';
import { MapPin, User, CheckCircle2, Lock, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 animate-fade-in pb-20 font-sans">
      {/* Header / Scene Banner */}
      <div className="relative w-full h-80 md:h-96 overflow-hidden border-b border-red-900/30 group">
        <img 
            src="https://img.freepik.com/free-photo/vintage-room-interior-with-old-books-scrolls_23-2149429415.jpg?t=st=1738596000~exp=1738599600~hmac=e2c9e7a8f1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1" 
            alt="Crime Scene" 
            className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-8 max-w-4xl">
           <div className="flex items-center gap-2 text-red-500 font-bold tracking-widest text-xs uppercase mb-2">
             <MapPin size={14} />
             案发现场 / CRIME SCENE
           </div>
           <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 shadow-black drop-shadow-md tracking-wide">
             {caseData.title}
           </h1>
           <div className="flex flex-wrap gap-4 mb-5 text-xs font-mono text-slate-300">
             <span className="bg-red-950/60 px-3 py-1 rounded border border-red-900/50 text-red-200">死者: 李老爷</span>
             <span className="bg-slate-800/60 px-3 py-1 rounded border border-slate-700">死因: 头部钝器重击</span>
             <span className="bg-amber-900/40 px-3 py-1 rounded border border-amber-900/30 text-amber-200">难度: {caseData.difficulty}</span>
           </div>
           <div className="relative">
               <div className="absolute -left-4 top-0 bottom-0 w-1 bg-red-600 rounded-full"></div>
               <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl bg-black/40 p-4 rounded-r-lg backdrop-blur-sm border border-slate-800/50 shadow-xl">
                 {caseData.introduction}
               </p>
           </div>
        </div>
      </div>

      {/* Suspects List */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-slate-300 mb-8 flex items-center justify-between border-b border-slate-800 pb-4">
           <div className="flex items-center gap-2">
             <User size={20} className="text-red-500" /> 
             <span className="tracking-wide">嫌疑人名单</span>
             <span className="text-xs text-slate-500 font-normal ml-2">(点击头像进行审讯)</span>
           </div>
           <div className="text-sm font-normal text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              审讯进度: <span className={allInterrogated ? "text-green-500 font-bold" : "text-amber-500 font-bold"}>{interrogatedSuspectIds.length}/{caseData.suspects.length}</span>
           </div>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseData.suspects.map((suspect) => {
            const isInterrogated = interrogatedSuspectIds.includes(suspect.id);
            return (
                <div 
                  key={suspect.id}
                  onClick={() => onSelectSuspect(suspect)}
                  className="group cursor-pointer bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:transform hover:-translate-y-2 shadow-xl hover:shadow-2xl relative"
                >
                  {/* Status Badge */}
                  {isInterrogated && (
                      <div className="absolute top-3 right-3 z-20 bg-green-900/90 text-green-200 px-2 py-1 rounded flex items-center gap-1 backdrop-blur-md border border-green-500/30 shadow-lg">
                          <CheckCircle2 size={14} />
                          <span className="text-xs font-bold">已完成</span>
                      </div>
                  )}

                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={getAvatarUrl(suspect.avatarStyle)} 
                      alt={suspect.name}
                      className={`w-full h-full object-cover transition-transform duration-700 ${isInterrogated ? 'grayscale-[0.8] brightness-75' : 'grayscale-[0.2]'} group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-100`}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex justify-between items-end border-b border-slate-700 pb-2 mb-2">
                          <h3 className="text-2xl font-serif font-bold text-white tracking-wider">{suspect.name}</h3>
                          <span className="bg-red-900/30 text-red-400 border border-red-900/50 px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded">{suspect.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-0 relative">
                    <div className="absolute top-0 right-4 -mt-3 bg-slate-800 rounded-full p-2 border border-slate-700 group-hover:border-red-500/50 transition-colors">
                        <FileText size={16} className="text-slate-400 group-hover:text-red-400" />
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mt-2 min-h-[3rem] line-clamp-2 group-hover:text-slate-300 transition-colors">
                      {suspect.description}
                    </p>
                  </div>
                </div>
            );
          })}
        </div>
      </div>
      
      {/* Solve Button Fixed Bottom */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 flex justify-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
         {allInterrogated ? (
             <button 
               onClick={onSolve}
               className="bg-red-700 hover:bg-red-600 text-white px-10 py-3 rounded-lg font-bold border border-red-500 transition-all w-full max-w-md shadow-[0_0_20px_rgba(220,38,38,0.3)] animate-pulse hover:animate-none flex items-center justify-center gap-2 transform hover:scale-105"
             >
               <CheckCircle2 size={18} />
               <span>指认凶手 (提交结案报告)</span>
             </button>
         ) : (
             <div className="bg-slate-900/80 text-slate-500 px-8 py-3 rounded-lg font-bold border border-slate-700 w-full max-w-md flex items-center justify-center gap-2 cursor-not-allowed opacity-70">
                 <Lock size={16} />
                 <span>请先完成所有审讯 ({interrogatedSuspectIds.length}/{caseData.suspects.length})</span>
             </div>
         )}
      </div>
    </div>
  );
};