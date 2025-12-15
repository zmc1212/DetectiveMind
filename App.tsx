import React, { useState } from 'react';
import { Difficulty, GamePhase, CaseData, Message, EvaluationResult, Suspect } from './types';
import { generateCase, investigateCase, evaluateSolution } from './services/geminiService';
import { MainMenu } from './components/MainMenu';
import { CaseDashboard } from './components/CaseDashboard';
import { InterrogationView } from './components/InterrogationView';
import { Loader2, Award, ShieldAlert, RotateCcw, AlertTriangle, Lock } from 'lucide-react';

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
  
  const getAvatarUrl = (style?: string) => {
    if (!style) return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
    const s = style.toLowerCase();
    if (s.includes('butler')) return 'https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80';
    if (s.includes('lady')) return 'https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80';
    if (s.includes('driver')) return 'https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80';
    return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
  };

  if (phase === GamePhase.MENU) {
    return <MainMenu onStart={startGame} difficulty={difficulty} setDifficulty={setDifficulty} />;
  }

  if (phase === GamePhase.LOADING) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
        <h2 className="text-xl font-serif text-slate-300 animate-pulse tracking-widest uppercase">
          {evaluation ? "正在核实真相..." : "正在构建案发现场..."}
        </h2>
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
             {/* Header */}
             <div className="absolute top-0 w-full p-8 text-center z-20">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold mb-2">
                    <AlertTriangle size={24} />
                    <span className="uppercase tracking-[0.3em] text-xl">指认凶手</span>
                </div>
                <p className="text-slate-400 text-sm tracking-wide">只有一次机会，请慎重点击你认为的真凶。</p>
             </div>

             {/* Suspects Stage */}
             <div className="flex-1 flex items-center justify-center gap-4 md:gap-12 px-4 relative z-10">
                {currentCase.suspects.map((suspect) => {
                    const isSelected = accusedSuspectId === suspect.id;
                    return (
                        <div 
                           key={suspect.id}
                           className="group relative cursor-pointer transition-all duration-500"
                           onClick={() => setAccusedSuspectId(suspect.id)}
                           style={{ 
                               transform: isSelected ? 'scale(1.1) translateY(-20px)' : 'scale(1)',
                               zIndex: isSelected ? 30 : 10,
                               filter: isSelected ? 'none' : accusedSuspectId ? 'grayscale(100%) brightness(30%)' : 'grayscale(100%) brightness(70%)'
                           }}
                        >
                            {/* Guilty Label Overlay */}
                            <div className={`absolute top-[20%] left-1/2 -translate-x-1/2 z-50 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="border-[5px] border-red-600 text-red-600 px-6 py-2 font-black text-2xl md:text-5xl tracking-widest uppercase bg-black/20 backdrop-blur-sm transform -rotate-12 shadow-[0_0_30px_rgba(220,38,38,0.8)] whitespace-nowrap font-serif">
                                    凶手?!
                                </div>
                            </div>
                            
                            {/* Image */}
                            <img 
                                src={getAvatarUrl(suspect.avatarStyle)}
                                alt={suspect.name}
                                className={`
                                    h-[50vh] md:h-[65vh] object-cover transition-all duration-500 mask-image-gradient
                                    ${isSelected ? 'drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]' : 'group-hover:brightness-110'}
                                `}
                            />
                            
                            {/* Name Tag */}
                            <div className={`absolute bottom-0 w-full text-center transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-50'}`}>
                                <div className={`inline-block px-6 py-2 mb-2 rounded ${isSelected ? 'bg-red-900/90 text-white' : 'bg-slate-800/80 text-slate-400'}`}>
                                    <h3 className="font-serif text-xl tracking-wider">{suspect.name}</h3>
                                    <p className="text-[10px] uppercase tracking-wider opacity-80">{suspect.role}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* Input & Footer */}
             <div className={`
                fixed bottom-0 w-full bg-gradient-to-t from-red-950/90 to-black/90 p-8 z-40 backdrop-blur-md border-t border-red-900/30 transition-transform duration-500 ease-out
                ${accusedSuspectId ? 'translate-y-0' : 'translate-y-full'}
             `}>
                 <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-6 items-end">
                     <div className="flex-1 w-full">
                         <label className="text-red-500 text-xs font-bold uppercase mb-2 block tracking-wider flex items-center gap-2">
                             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                             你的推理 (Detective's Log)
                         </label>
                         <input 
                            type="text" 
                            value={motiveInput}
                            onChange={(e) => setMotiveInput(e.target.value)}
                            placeholder="请简述动机或作案手法 (帮助判定准确度)..."
                            className="w-full bg-black/50 border-b-2 border-red-900/50 text-white px-2 py-3 focus:outline-none focus:border-red-500 placeholder-red-900/40 text-lg transition-colors"
                         />
                     </div>
                     <button
                        onClick={handleSolveSubmit}
                        className="bg-red-700 hover:bg-red-600 text-white px-10 py-3 rounded-lg font-bold shadow-lg transition-all whitespace-nowrap tracking-wide border border-red-500 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                     >
                        确认指认
                     </button>
                 </div>
             </div>
             
             {/* Back Button */}
             {!accusedSuspectId && (
                 <button 
                    onClick={() => setPhase(GamePhase.DASHBOARD)}
                    className="fixed bottom-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 z-50 bg-black/20 px-4 py-2 rounded-full hover:bg-black/40 backdrop-blur-sm"
                 >
                    <RotateCcw size={16} /> <span className="text-sm font-bold">返回思考</span>
                 </button>
             )}
          </div>
      );
  }

  if (phase === GamePhase.RESULT && evaluation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className={`p-10 text-center ${evaluation.correct ? 'bg-green-900/20' : 'bg-red-900/20'} relative overflow-hidden`}>
            {/* BG pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
            
            <div className="flex justify-center mb-6 relative z-10">
              {evaluation.correct ? (
                <div className="p-5 bg-green-900/30 rounded-full ring-2 ring-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]"><Award size={64} className="text-green-500" /></div>
              ) : (
                <div className="p-5 bg-red-900/30 rounded-full ring-2 ring-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.3)]"><ShieldAlert size={64} className="text-red-500" /></div>
              )}
            </div>
            <h1 className="text-5xl font-serif font-bold text-slate-100 mb-2 tracking-wide relative z-10">
              {evaluation.correct ? "结案成功" : "推断错误"}
            </h1>
            <p className={`text-xl font-mono mt-4 font-bold ${evaluation.correct ? 'text-green-400' : 'text-red-400'} relative z-10`}>
              真相还原度: {evaluation.percentage}%
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-inner">
              <h3 className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                  <Award size={14} /> 侦探评估
              </h3>
              <p className="text-slate-300 leading-relaxed text-lg font-serif">{evaluation.feedback}</p>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-slate-800">
              <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                   <Lock size={14} /> 案件真相 (档案解密)
              </h3>
              <p className="text-slate-400 leading-relaxed italic text-sm">
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
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4 hover:shadow-lg border border-slate-700 hover:border-slate-600"
            >
              <RotateCcw size={20} /> 返回侦探社
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default App;