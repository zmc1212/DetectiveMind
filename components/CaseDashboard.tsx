import React, { useState, useEffect } from 'react';
import { CaseData, Suspect } from '../types';
import { MapPin, User, CheckCircle2, Lock, FileText, Search } from 'lucide-react';
import { playTypingSound } from '../utils/sound';

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
  const [typedIntro, setTypedIntro] = useState('');
  
  // Typewriter effect for introduction
  useEffect(() => {
    let index = 0;
    const speed = 30; 
    setTypedIntro('');
    
    const timer = setInterval(() => {
      if (index < caseData.introduction.length) {
        setTypedIntro((prev) => prev + caseData.introduction.charAt(index));
        // Play sound every few characters to avoid being too annoying
        if (index % 2 === 0) playTypingSound();
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [caseData.introduction]);

  const allInterrogated = caseData.suspects.length === interrogatedSuspectIds.length;

  const getAvatarUrl = (suspect: Suspect) => {
    if (suspect.imageUrl) return suspect.imageUrl;
    const style = suspect.avatarStyle || '';
    if (style.toLowerCase().includes('butler')) return 'https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80';
    if (style.toLowerCase().includes('lady')) return 'https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80';
    if (style.toLowerCase().includes('driver')) return 'https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80';
    return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 animate-fade-in pb-24 font-sans selection:bg-red-900 selection:text-white">
      {/* Dynamic Header / Scene Banner */}
      <div className="relative w-full h-[50vh] overflow-hidden group border-b border-slate-900">
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <img 
            src="https://img.freepik.com/free-photo/vintage-room-interior-with-old-books-scrolls_23-2149429415.jpg?t=st=1738596000~exp=1738599600~hmac=e2c9e7a8f1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1b4a8a1" 
            alt="Crime Scene" 
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[20s] ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/60 to-transparent z-20"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-30 max-w-5xl mx-auto flex flex-col md:flex-row items-end gap-8">
           <div className="flex-1">
              <div className="flex items-center gap-3 text-red-500 font-bold tracking-[0.2em] text-xs uppercase mb-4 animate-slide-up">
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                 <MapPin size={14} />
                 案发现场
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 shadow-black drop-shadow-2xl tracking-tight leading-none animate-slide-up" style={{animationDelay: '0.1s'}}>
                {caseData.title}
              </h1>
              
              <div className="relative bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-lg shadow-xl animate-slide-up" style={{animationDelay: '0.2s'}}>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed font-mono">
                    <span className="text-red-400 mr-2">{'>'}</span>
                    {typedIntro}
                    <span className="inline-block w-2 h-4 bg-red-500 ml-1 animate-pulse"></span>
                  </p>
              </div>
           </div>
           
           <div className="flex flex-col gap-3 animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="bg-slate-800/80 px-4 py-2 rounded text-xs font-mono border border-slate-700 text-slate-400">
                死者: <span className="text-white">李老爷</span>
              </div>
              <div className="bg-slate-800/80 px-4 py-2 rounded text-xs font-mono border border-slate-700 text-slate-400">
                死因: <span className="text-white">头部重击</span>
              </div>
              <div className="bg-red-900/30 px-4 py-2 rounded text-xs font-mono border border-red-900/50 text-red-300">
                难度: {caseData.difficulty}
              </div>
           </div>
        </div>
      </div>

      {/* Suspects Dossier Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-4">
           <h2 className="text-2xl font-serif font-bold text-slate-200 flex items-center gap-3">
             <div className="bg-slate-800 p-2 rounded-lg">
                <User size={24} className="text-red-500" />
             </div>
             <span className="tracking-wide">嫌疑人档案</span>
           </h2>
           
           <div className="flex items-center gap-3">
              <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">调查进度</span>
              <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${allInterrogated ? 'bg-green-500' : 'bg-red-600'}`}
                  style={{ width: `${(interrogatedSuspectIds.length / caseData.suspects.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-slate-400 font-mono text-sm">{interrogatedSuspectIds.length}/{caseData.suspects.length}</span>
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseData.suspects.map((suspect, idx) => {
            const isInterrogated = interrogatedSuspectIds.includes(suspect.id);
            return (
                <div 
                  key={suspect.id}
                  onClick={() => onSelectSuspect(suspect)}
                  className="group relative cursor-pointer perspective-1000 animate-slide-up"
                  style={{ animationDelay: `${0.2 + (idx * 0.1)}s` }}
                >
                  {/* Card Container with Paper Style */}
                  <div className="relative bg-slate-900 border border-slate-700 hover:border-red-500/50 rounded-sm transition-all duration-300 group-hover:-translate-y-2 shadow-lg group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden h-full flex flex-col">
                    
                    {/* Top Secret Stamp */}
                    {isInterrogated && (
                       <div className="absolute top-4 right-4 z-20 border-2 border-green-500/50 text-green-500 px-2 py-1 text-xs font-black uppercase tracking-widest rotate-12 opacity-80 backdrop-blur-sm shadow-sm">
                          已审讯
                       </div>
                    )}
                    
                    {/* Image Area */}
                    <div className="h-72 overflow-hidden relative">
                      <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/10 z-10 transition-colors duration-300"></div>
                      <img 
                        src={getAvatarUrl(suspect)} 
                        alt={suspect.name}
                        className={`w-full h-full object-cover transition-transform duration-700 ${isInterrogated ? 'grayscale contrast-125' : 'grayscale-[0.5]'} group-hover:scale-110`}
                      />
                      
                      {/* Overlay Info */}
                      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/90 to-transparent z-10">
                         <h3 className="text-3xl font-serif font-bold text-white tracking-wide mb-1">{suspect.name}</h3>
                         <div className="flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-widest rounded-sm">
                                {suspect.role}
                            </span>
                         </div>
                      </div>
                    </div>

                    {/* Description Area (Paper texture feel) */}
                    <div className="p-6 bg-[#0f172a] relative flex-1 border-t border-slate-800">
                       <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
                       <FileText size={16} className="text-slate-600 mb-3 group-hover:text-red-500 transition-colors" />
                       <p className="text-slate-400 text-sm leading-relaxed font-serif line-clamp-3 group-hover:text-slate-300">
                          {suspect.description}
                       </p>
                       
                       <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-end">
                          <span className="text-xs font-bold text-red-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 duration-300">
                             审讯 <Search size={12} />
                          </span>
                       </div>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      </div>
      
      {/* Solve Button - Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50">
         <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent h-32 pointer-events-none"></div>
         <div className="relative flex justify-center pb-8 pt-10">
             {allInterrogated ? (
                 <button 
                   onClick={onSolve}
                   className="relative group overflow-hidden bg-red-700 text-white px-12 py-4 rounded-lg font-bold shadow-[0_0_30px_rgba(185,28,28,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(185,28,28,0.6)]"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                   <div className="flex items-center gap-3 relative z-10">
                     <CheckCircle2 size={20} />
                     <span className="tracking-[0.1em] text-lg">指认凶手</span>
                   </div>
                 </button>
             ) : (
                 <div className="bg-slate-900/90 backdrop-blur border border-slate-800 text-slate-500 px-8 py-3 rounded-full font-mono text-sm flex items-center gap-3 shadow-lg">
                     <Lock size={14} />
                     <span>需要完成所有嫌疑人审讯 ({interrogatedSuspectIds.length}/{caseData.suspects.length})</span>
                 </div>
             )}
         </div>
      </div>
    </div>
  );
};