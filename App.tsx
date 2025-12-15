import React, { useState } from 'react';
import { Difficulty, GamePhase, CaseData, Message, EvaluationResult, Suspect } from './types';
import { generateCase, investigateCase, evaluateSolution } from './services/geminiService';
import { MainMenu } from './components/MainMenu';
import { CaseDashboard } from './components/CaseDashboard';
import { InterrogationView } from './components/InterrogationView';
import { Loader2, Award, ShieldAlert, RotateCcw, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MEDIUM);
  const [currentCase, setCurrentCase] = useState<CaseData | null>(null);
  
  // State for interrogation
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  // Store messages per suspect: { suspectId: Message[] }
  const [suspectChats, setSuspectChats] = useState<Record<string, Message[]>>({});
  const [isTyping, setIsTyping] = useState(false);

  // Solving State
  const [accusedSuspectId, setAccusedSuspectId] = useState<string | null>(null);
  const [motiveInput, setMotiveInput] = useState('');
  
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper: Get list of suspects who have at least one message in history
  const interrogatedSuspectIds = Object.keys(suspectChats).filter(id => suspectChats[id].length > 0);

  const startGame = async () => {
    setPhase(GamePhase.LOADING);
    setError(null);
    try {
      const newCase = await generateCase(difficulty);
      setCurrentCase(newCase);
      // Initialize chat history for each suspect
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

    // Optimistic update
    setSuspectChats(prev => ({
        ...prev,
        [selectedSuspectId]: [...(prev[selectedSuspectId] || []), userMsg]
    }));

    setIsTyping(true);

    try {
      const currentHistory = suspectChats[selectedSuspectId] || [];
      // Include user msg in history passed to AI
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

    // Combine selection + motive for the AI evaluator
    const fullSolution = `I accuse ${accused.name}. Motive/Method: ${motiveInput || "Based on the evidence found."}`;

    setPhase(GamePhase.LOADING);
    try {
      const result = await evaluateSolution(currentCase, fullSolution);
      setEvaluation(result);
      setPhase(GamePhase.RESULT);
    } catch (err) {
      setError("提交失败，请重试。");
      setPhase(GamePhase.SOLVING); // Return to solving screen
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

  // Render Logic

  if (phase === GamePhase.MENU) {
    return <MainMenu onStart={startGame} difficulty={difficulty} setDifficulty={setDifficulty} />;
  }

  if (phase === GamePhase.LOADING) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <Loader2 className="w-16 h-16 text-red-600 animate-spin mb-4" />
        <h2 className="text-xl font-serif text-slate-300 animate-pulse tracking-widest uppercase">
          {evaluation ? "VERIFYING TRUTH..." : "CONSTRUCTING CRIME SCENE..."}
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
          />
      );
  }

  if (phase === GamePhase.SOLVING && currentCase) {
      return (
          <div className="min-h-screen bg-black flex flex-col relative overflow-hidden animate-fade-in">
             {/* Header */}
             <div className="absolute top-0 w-full p-8 text-center z-20">
                <div className="flex items-center justify-center gap-2 text-red-600 font-bold mb-2">
                    <AlertTriangle size={24} />
                    <span className="uppercase tracking-[0.2em]">指认凶手</span>
                </div>
                <p className="text-slate-400 text-sm">只有一次机会，请点击你认为是凶手的人。</p>
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
                                <div className="border-4 border-red-600 text-red-600 px-4 py-2 font-black text-2xl md:text-4xl tracking-widest uppercase bg-black/20 backdrop-blur-sm transform -rotate-12 shadow-[0_0_20px_rgba(220,38,38,0.6)]">
                                    GUILTY?
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
                                <div className={`inline-block px-4 py-1 mb-2 ${isSelected ? 'bg-red-900 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                    <h3 className="font-serif text-lg">{suspect.name}</h3>
                                    <p className="text-[10px] uppercase tracking-wider">{suspect.role}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>

             {/* Input & Footer */}
             <div className={`
                fixed bottom-0 w-full bg-gradient-to-t from-red-950/90 to-black/80 p-6 z-40 backdrop-blur-md border-t border-red-900/30 transition-transform duration-500 ease-out
                ${accusedSuspectId ? 'translate-y-0' : 'translate-y-full'}
             `}>
                 <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
                     <div className="flex-1 w-full">
                         <label className="text-red-500 text-xs font-bold uppercase mb-2 block tracking-wider">
                             你的推理 (可选)
                         </label>
                         <input 
                            type="text" 
                            value={motiveInput}
                            onChange={(e) => setMotiveInput(e.target.value)}
                            placeholder="简述动机或作案手法 (选填)..."
                            className="w-full bg-black/50 border-b border-red-800 text-white px-0 py-2 focus:outline-none focus:border-red-500 placeholder-red-900/50"
                         />
                     </div>
                     <button
                        onClick={handleSolveSubmit}
                        className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded font-bold shadow-lg transition-colors whitespace-nowrap"
                     >
                        确认指认
                     </button>
                 </div>
             </div>
             
             {/* Back Button (Only visible if nothing selected or distinct logic) */}
             {!accusedSuspectId && (
                 <button 
                    onClick={() => setPhase(GamePhase.DASHBOARD)}
                    className="fixed bottom-8 left-8 text-slate-500 hover:text-white transition-colors flex items-center gap-2 z-50"
                 >
                    <RotateCcw size={16} /> 返回思考
                 </button>
             )}
          </div>
      );
  }

  if (phase === GamePhase.RESULT && evaluation) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
          <div className={`p-10 text-center ${evaluation.correct ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
            <div className="flex justify-center mb-6">
              {evaluation.correct ? (
                <div className="p-4 bg-green-900/30 rounded-full"><Award size={64} className="text-green-500" /></div>
              ) : (
                <div className="p-4 bg-red-900/30 rounded-full"><ShieldAlert size={64} className="text-red-500" /></div>
              )}
            </div>
            <h1 className="text-4xl font-serif font-bold text-slate-100 mb-2 tracking-wide">
              {evaluation.correct ? "结案" : "推断错误"}
            </h1>
            <p className={`text-xl font-mono mt-4 ${evaluation.correct ? 'text-green-400' : 'text-red-400'}`}>
              匹配度: {evaluation.percentage}%
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
              <h3 className="text-red-500 text-xs uppercase tracking-widest font-bold mb-3">侦探评估</h3>
              <p className="text-slate-300 leading-relaxed text-lg">{evaluation.feedback}</p>
            </div>

            <div className="bg-black/40 p-6 rounded-xl border border-slate-800">
              <h3 className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-3">案件真相</h3>
              <p className="text-slate-400 leading-relaxed italic">
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
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4"
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