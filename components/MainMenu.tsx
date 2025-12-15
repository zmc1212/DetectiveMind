import React from 'react';
import { Search, Users, Fingerprint, ChevronRight } from 'lucide-react';
import { Difficulty } from '../types';

interface MainMenuProps {
  onStart: () => void;
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onStart, difficulty, setDifficulty }) => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-5xl animate-fade-in flex flex-col items-center">
        {/* Title Section */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-red-700 tracking-wider drop-shadow-lg mb-4" style={{ fontFamily: '"Crimson Text", serif' }}>
            神探之心
          </h1>
          <p className="text-slate-400 text-lg md:text-xl tracking-[0.2em] uppercase">Detective Mind</p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl backdrop-blur-sm hover:bg-slate-800/50 transition duration-300 flex flex-col items-center group">
            <Search className="w-12 h-12 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-slate-200 mb-2">勘查现场</h3>
            <p className="text-slate-500 text-sm leading-relaxed">分析环境描述<br/>寻找关键线索</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl backdrop-blur-sm hover:bg-slate-800/50 transition duration-300 flex flex-col items-center group">
            <Users className="w-12 h-12 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-slate-200 mb-2">审讯嫌疑人</h3>
            <p className="text-slate-500 text-sm leading-relaxed">三人对峙<br/>三轮问答，找出漏洞</p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-xl backdrop-blur-sm hover:bg-slate-800/50 transition duration-300 flex flex-col items-center group">
            <Fingerprint className="w-12 h-12 text-red-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-slate-200 mb-2">指认凶手</h3>
            <p className="text-slate-500 text-sm leading-relaxed">五大关卡<br/>难度递增</p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-bold text-white transition-all duration-200 bg-gradient-to-r from-red-800 to-red-900 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-900 shadow-[0_0_20px_rgba(153,27,27,0.5)]"
        >
          <span>开始调查</span>
          <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        
        <div className="mt-8 flex gap-4">
             {Object.values(Difficulty).map(d => (
                 <button 
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`text-xs px-3 py-1 rounded border ${difficulty === d ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-slate-700 text-slate-600 hover:text-slate-400'}`}
                 >
                    {d}
                 </button>
             ))}
        </div>

        <p className="mt-8 text-amber-600/60 text-xs flex items-center gap-2">
          ⚠ 未配置 API Key，将使用离线剧本模式 (Demo) / AI 生成模式
        </p>
      </div>
    </div>
  );
};