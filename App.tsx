import React, { useState } from 'react';
import { Difficulty, GamePhase, CaseData, Message, EvaluationResult, Suspect } from './types';
import { generateCase, investigateCase, evaluateSolution } from './services/geminiService';
import { MainMenu } from './components/MainMenu';
import { CaseDashboard } from './components/CaseDashboard';
import { InterrogationView } from './components/InterrogationView';
import { Loader2, Award, ShieldAlert, RotateCcw, AlertTriangle, Fingerprint } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  
  // State for interrogation
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [suspectChats, setSuspectChats] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);

  // Solving State
  const [accusedSuspectId, setAccusedSuspectId] = useState<string | null>(null);
  const [motiveInput, setMotiveInput] = useState('');
  
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interrogatedSuspectIds = Object.keys(suspectChats).filter(id => suspectChats[id].length > 0);

  const startGame = async () => {
    setPhase(GamePhase.LOADING);
    setError(null);
    try {
      const newCase = await generateCase(difficulty);
      setCurrentCase(newCase);
      const initialChats: Record<string, Message[]> = {};
      newCase.suspects.forEach(s => {
          initialChats[s.id] = [];
      });
      setSuspectChats(initialChats);
      setAccusedSuspectId(null);
      setMotiveInput('');
      setPhase(GamePhase.DASHBOARD);
    } catch (err) {
      setError("启动失败，请检查网络设置。");
      setPhase(GamePhase.MENU);
    }
  };

  const handleSelectSuspect = (suspect: Suspect) => {
    setSelectedSuspectId(suspect.id);
    setPhase(GamePhase.INTERROGATION);
  };

  const handleSendMessage = async (text: string) => {
    if (!currentCase || !selectedSuspectId) return;
    
    const activeSuspect = currentCase.suspects.find(s => s.id === selectedSuspectId);
    if (!activeSuspect) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setSuspectChats(prev => ({
        ...prev,
        [selectedSuspectId]: [...(prev[selectedSuspectId] || []), userMsg]
    }));

    setIsTyping(true);

    try {
      const currentHistory = suspectChats[selectedSuspectId] || [];
      const responseText = await investigateCase(currentCase, activeSuspect, [...currentHistory, userMsg], text);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'suspect',
        content: responseText,
        timestamp: Date.now(),
      };
      
      setSuspectChats(prev => ({
        ...prev,
        [selectedSuspectId]: [...(prev[selectedSuspectId] || []), aiMsg]
      }));

    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSolveSubmit = async () => {
    if (!currentCase || !accusedSuspectId) return;
    
    const accused = currentCase.suspects.find(s => s.id === accusedSuspectId);
    if(!accused) return;

    const fullSolution = `指认凶手: ${accused.name}。 动机/手法: ${motiveInput || "基于已知证据。"}`;

    setPhase(GamePhase.LOADING);
    try {
      const result = await evaluateSolution(currentCase, fullSolution);
      setEvaluation(result);
      setPhase(GamePhase.RESULT);
    } catch (err) {
      setError("提交失败，请重试。");
      setPhase(GamePhase.SOLVING); 
    }
  };
  
  const getAvatarUrl = (suspect: Suspect) => {
    if (suspect.imageUrl) return suspect.imageUrl;

    const style = suspect.avatarStyle || '';
    if (style.toLowerCase().includes('butler')) return 'https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80';
    if (style.toLowerCase().includes('lady')) return 'https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80';
    if (style.toLowerCase().includes('driver')) return 'https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80';
    return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
  };

  if (phase === GamePhase.MENU) {
    return <MainMenu onStart={startGame} difficulty={difficulty} setDifficulty={setDifficulty} />;
  }

  if (phase === GamePhase.LOADING) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Abstract Loader Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-black to-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
             <div className="relative">
                 <Loader2 className="w-16 h-16 text-red-600 animate-spin" />
                 <div className="absolute inset-0 bg-red-600 blur-xl opacity-30 animate-pulse"></div>
             </div>
             <h2 className="text-xl font-serif text-slate-300 mt-8 tracking-[0.3em] uppercase animate-pulse">
               {evaluation ? "正在验证推理..." : "正在构建案发现场..."}
             </h2>
        </div>
      </div>
    );
  }

  if (phase === GamePhase.DASHBOARD && currentCase) {
      return (
          <CaseDashboard 
             caseData={currentCase} 
             onSelectSuspect={handleSelectSuspect} 
             onSolve={() => setPhase(GamePhase.SOLVING)}
             interrogatedSuspectIds={interrogatedSuspectIds}
          />
      );
  }

  if (phase === GamePhase.INTERROGATION && currentCase && selectedSuspectId) {
      const suspect = currentCase.suspects.find(s => s.id === selectedSuspectId)!;
      return (
          <InterrogationView 
             suspect={suspect}
             messages={suspectChats[selectedSuspectId] || []}
             onSendMessage={handleSendMessage}
             onBack={() => setPhase(GamePhase.DASHBOARD)}
             isTyping={isTyping}
             difficulty={difficulty}
          />
      );
  }

  if (phase === GamePhase.SOLVING && currentCase) {
      return (
          <div className="min-h-screen bg-black flex flex-col relative overflow-hidden animate-fade-in font-sans">
             {/* Dramatic Lighting Overlay */}
             <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-20"></div>
             
             {/* Header */}
             <div className="absolute top-0 w-full p-8 text-center z-30">
                <div className="inline-block border-2 border-red-800 p-4 bg-black/50 backdrop-blur-md">
                    <div className="flex items-center justify-center gap-3 text-red-600 font-bold mb-1">
                        <AlertTriangle size={24} />
                        <span className="uppercase tracking-[0.3em] text-2xl font-serif">最终审判</span>
                        <AlertTriangle size={24} />
                    </div>
                    <p className="text-slate-500 text-xs tracking-widest uppercase">请指认真凶。一旦选定，无法回头。</p>
                </div>
             </div>

             {/* Suspects Stage - Spotlight Effect */}
             <div className="flex-1 flex items-center justify-center gap-4 md:gap-12 px-4 relative z-10">
                {currentCase.suspects.map((suspect) => {
                    const isSelected = accusedSuspectId === suspect.id;
                    const isOtherSelected = accusedSuspectId !== null && !isSelected;
                    
                    return (
                        <div 
                           key={suspect.id}
                           className={`
                                group relative cursor-pointer transition-all duration-700 ease-out
                                ${isSelected ? 'scale-110 z-40 grayscale-0' : 'scale-95 grayscale hover:grayscale-[0.5] hover:scale-100'}
                                ${isOtherSelected ? 'opacity-30 blur-sm scale-90' : 'opacity-100'}
                           `}
                           onClick={() => setAccusedSuspectId(suspect.id)}
                        >
                            {/* Spotlight Beam */}
                            <div className={`
                                absolute -top-[50%] left-1/2 -translate-x-1/2 w-[200px] h-[1000px] 
                                bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none
                                transition-opacity duration-700 transform -rotate-12 origin-top
                                ${isSelected ? 'opacity-100' : 'opacity-0'}
                            `}></div>

                            {/* Guilty Label Overlay */}
                            <div className={`absolute top-[30%] left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}>
                                <div className="border-[6px] border-red-600 text-red-600 px-6 py-2 font-black text-3xl md:text-5xl tracking-widest uppercase bg-black/40 backdrop-blur-sm transform -rotate-12 shadow-[0_0_50px_rgba(220,38,38,0.8)] whitespace-nowrap font-serif mix-blend-hard-light">
                                    凶手
                                </div>
                            </div>
                            
                            {/* Image */}
                            <img 
                                src={getAvatarUrl(suspect)}
                                alt={suspect.name}
                                className={`
                                    h-[50vh] md:h-[65vh] object-cover transition-all duration-700
                                    mask-image-gradient drop-shadow-2xl
                                    ${isSelected ? 'brightness-110 contrast-125' : 'brightness-50 contrast-100'}
                                `}
                            />
                            
                            {/* Name Tag */}
                            <div className={`absolute bottom-10 w-full text-center transition-all duration-500 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4'}`}>
                                <h3 className="font-serif text-3xl text-slate-100 tracking-wider mb-1 text-shadow-lg">{suspect.name}</h3>
                                <p className="text-xs uppercase tracking-[0.3em] text-red-500 font-bold">{suspect.role}</p>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* Input & Footer */}
             <div className={`
                fixed bottom-0 w-full bg-gradient-to-t from-red-950 to-black p-10 z-50 border-t border-red-900/50 transition-transform duration-500 ease-out shadow-[0_-20px_50px_rgba(0,0,0,0.8)]
                ${accusedSuspectId ? 'translate-y-0' : 'translate-y-full'}
             `}>
                 <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-end">
                     <div className="flex-1 w-full">
                         <label className="text-red-500 text-xs font-bold uppercase mb-3 block tracking-[0.2em] flex items-center gap-2">
                             <Fingerprint size={16} className="animate-pulse" />
                             案件分析 / 动机
                         </label>
                         <input 
                            type="text" 
                            value={motiveInput}
                            onChange={(e) => setMotiveInput(e.target.value)}
                            placeholder="描述作案动机或手法..."
                            className="w-full bg-black/40 border-b-2 border-red-900 text-white px-4 py-4 focus:outline-none focus:border-red-500 placeholder-slate-600 text-xl font-serif transition-colors"
                            autoFocus
                         />
                     </div>
                     <button
                        onClick={handleSolveSubmit}
                        className="bg-red-700 hover:bg-red-600 text-white px-12 py-4 rounded-sm font-bold shadow-lg transition-all whitespace-nowrap tracking-widest border border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] uppercase"
                     >
                        确认指认
                     </button>
                 </div>
             </div>
             
             {/* Back Button */}
             {!accusedSuspectId && (
                 <button 
                    onClick={() => setPhase(GamePhase.DASHBOARD)}
                    className="fixed bottom-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 z-50 bg-black/20 px-6 py-3 rounded-full hover:bg-black/60 backdrop-blur-sm border border-transparent hover:border-slate-700"
                 >
                    <RotateCcw size={16} /> <span className="text-xs font-bold uppercase tracking-wider">取消并返回</span>
                 </button>
             )}
          </div>
      );
  }

  if (phase === GamePhase.RESULT && evaluation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative">
        {/* Background Ambience */}
        <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${evaluation.correct ? 'bg-green-900' : 'bg-red-900'}`}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>

        <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-none shadow-2xl overflow-hidden animate-slide-up relative z-10">
          <div className={`p-16 text-center ${evaluation.correct ? 'bg-gradient-to-b from-green-900/40 to-slate-900' : 'bg-gradient-to-b from-red-900/40 to-slate-900'} relative`}>
            
            <div className="flex justify-center mb-8 relative z-10">
              {evaluation.correct ? (
                <div className="p-8 bg-green-950 rounded-full border-4 border-green-600 shadow-[0_0_50px_rgba(34,197,94,0.5)] animate-float">
                    <Award size={80} className="text-green-500" />
                </div>
              ) : (
                <div className="p-8 bg-red-950 rounded-full border-4 border-red-600 shadow-[0_0_50px_rgba(239,68,68,0.5)] animate-pulse">
                    <ShieldAlert size={80} className="text-red-500" />
                </div>
              )}
            </div>
            
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-slate-100 mb-4 tracking-tighter relative z-10 text-shadow-lg">
              {evaluation.correct ? "结案：成功破案" : "结案：悬案未破"}
            </h1>
            
            <div className="flex justify-center items-center gap-4 mt-6">
                <div className="h-px w-12 bg-slate-600"></div>
                <p className={`text-2xl font-mono font-bold ${evaluation.correct ? 'text-green-400' : 'text-red-400'} tracking-widest`}>
                准确度: {evaluation.percentage}%
                </p>
                <div className="h-px w-12 bg-slate-600"></div>
            </div>
          </div>

          <div className="p-10 space-y-8 bg-slate-950 relative">
            <div className="p-8 border-l-4 border-amber-600 bg-slate-900/50">
              <h3 className="text-amber-600 text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                  <Award size={16} /> 侦探评估
              </h3>
              <p className="text-slate-300 leading-loose text-lg font-serif italic">"{evaluation.feedback}"</p>
            </div>

            <div className="p-8 border-l-4 border-slate-700 bg-black/40">
              <h3 className="text-slate-500 text-xs uppercase tracking-[0.2em] font-bold mb-4 flex items-center gap-2">
                   <Fingerprint size={16} /> 绝密档案：真相
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm font-mono opacity-80">
                {currentCase?.solution}
              </p>
            </div>

            <button
              onClick={() => {
                setPhase(GamePhase.MENU);
                setSuspectChats({});
                setAccusedSuspectId(null);
                setMotiveInput('');
                setEvaluation(null);
                setCurrentCase(null);
              }}
              className="w-full group bg-transparent border border-slate-700 text-slate-400 hover:text-white font-bold py-5 mt-6 transition-all hover:bg-slate-900 hover:border-slate-500 uppercase tracking-[0.2em] text-sm"
            >
              <span className="flex items-center justify-center gap-3">
                  <RotateCcw size={18} className="group-hover:-rotate-180 transition-transform duration-500" /> 
                  返回侦探社
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;