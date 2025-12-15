import React from 'react';
import { Search, Users, Fingerprint, ChevronRight, Play } from 'lucide-react';
import { Difficulty } from '../types';

interface MainMenuProps {
  onStart: () => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, difficulty, setDifficulty }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      
      {/* Background Ambience Layer */}
      <div className="absolute inset-0 pointer-events-none z-0">
         {/* Moving fog/light effect */}
         <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
         <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-30"></div>
      </div>

      <div className="z-10 w-full max-w-6xl flex flex-col items-center">
        
        {/* Title Section with Glitch/Noir Vibe */}
        <div className="mb-20 relative group cursor-default">
          <div className="absolute -inset-4 bg-red-500/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <h1 className="text-7xl md:text-9xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 tracking-tighter drop-shadow-2xl relative z-10 animate-fade-in" style={{ fontFamily: '"Crimson Text", serif' }}>
            神探之心
          </h1>
          <div className="h-px w-32 bg-red-600 mx-auto mt-4 mb-4 opacity-50 shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
          <p className="text-red-500/80 text-lg md:text-xl tracking-[0.5em] uppercase font-bold animate-slide-up" style={{animationDelay: '0.2s'}}>
            Detective Mind
          </p>
        </div>

        {/* Feature Cards - Floating & Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16 px-4">
          {[
            { icon: Search, title: "勘查现场", desc: "分析环境描述，寻找关键线索", delay: '0.3s' },
            { icon: Users, title: "审讯嫌疑人", desc: "三人对峙，找出证词漏洞", delay: '0.4s' },
            { icon: Fingerprint, title: "指认凶手", desc: "层层推理，还原案件真相", delay: '0.5s' }
          ].map((item, idx) => (
            <div 
              key={idx}
              className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl backdrop-blur-md hover:bg-slate-800/60 hover:border-red-900/50 transition-all duration-500 flex flex-col items-center group relative overflow-hidden animate-slide-up hover:-translate-y-2"
              style={{ animationDelay: item.delay }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-red-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="bg-slate-950 p-4 rounded-full mb-6 border border-slate-800 group-hover:border-red-500/30 group-hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-500 relative z-10">
                <item.icon className="w-8 h-8 text-slate-400 group-hover:text-red-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-200 mb-3 tracking-wide">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Difficulty Selection */}
        <div className="flex gap-4 mb-10 animate-fade-in" style={{animationDelay: '0.6s'}}>
             {Object.values(Difficulty).map(d => (
                 <button 
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`
                      relative px-6 py-2 rounded-full border text-sm font-bold tracking-wider uppercase transition-all duration-300
                      ${difficulty === d 
                        ? 'bg-red-900/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.3)]' 
                        : 'bg-transparent border-slate-800 text-slate-600 hover:border-slate-600 hover:text-slate-400'}
                    `}
                 >
                    {d}
                    {difficulty === d && <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20"></span>}
                 </button>
             ))}
        </div>

        {/* Start Button - Cinematic */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-16 py-5 text-xl font-bold text-white transition-all duration-300 bg-transparent rounded-lg focus:outline-none animate-slide-up overflow-hidden"
          style={{animationDelay: '0.7s'}}
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></span>
          <span className="relative flex items-center gap-4 z-10 text-red-100 group-hover:text-white transition-colors tracking-[0.2em]">
            开始调查 <Play size={18} fill="currentColor" />
          </span>
          
          {/* Custom Button Border/Glow */}
          <div className="absolute inset-0 border border-red-800/50 rounded-lg group-hover:border-red-500 transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-red-900/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        </button>

        <p className="mt-12 text-slate-700 text-xs font-mono uppercase tracking-widest animate-fade-in opacity-50">
          安全连接建立 • AI 案件档案库 • v2.0
        </p>
      </div>
    </div>
  );
};