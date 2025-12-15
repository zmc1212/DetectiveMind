import React, { useState, useEffect, useRef } from 'react';
import { Suspect, Message, Difficulty } from '../types';
import { ArrowLeft, Send, History, MessageSquare, ChevronRight, Mic, Volume2 } from 'lucide-react';
import { playTypingSound } from '../utils/sound';

interface InterrogationViewProps {
  suspect: Suspect;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  isTyping: boolean;
  difficulty: Difficulty;
}

export const InterrogationView: React.FC<InterrogationViewProps> = ({ 
  suspect, 
  messages, 
  onSendMessage, 
  onBack, 
  isTyping,
  difficulty
}) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [lastAcknowledgedId, setLastAcknowledgedId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState(''); 
  const scrollRef = useRef<HTMLDivElement>(null);

  const questionPool = [
    "你最后一次见到死者是什么时候？",
    "案发当晚10点，你在哪里？",
    "你好像隐瞒了什么秘密？",
    "你和死者生前发生过争执吗？",
    "对于案发现场的凶器，你有什么头绪？",
    "有人看到你案发时出现在附近。"
  ];

  const getQuestionCount = () => {
    switch (difficulty) {
      case Difficulty.EASY: return 3;
      case Difficulty.MEDIUM: return 4;
      case Difficulty.HARD: return 5;
      default: return 3;
    }
  };

  const activeQuestions = questionPool.slice(0, getQuestionCount());

  const getAvatarUrl = (suspect: Suspect) => {
    if (suspect.imageUrl) return suspect.imageUrl;
    const style = suspect.avatarStyle || '';
    if (style.toLowerCase().includes('butler')) return 'https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80';
    if (style.toLowerCase().includes('lady')) return 'https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80';
    if (style.toLowerCase().includes('driver')) return 'https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80';
    return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
  };

  const handleOptionClick = (text: string) => {
    if (!isTyping) onSendMessage(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleContinue = () => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && displayedText !== lastMsg.content) {
      setDisplayedText(lastMsg.content);
      return;
    }
    if (lastMsg) setLastAcknowledgedId(lastMsg.id);
  };

  const lastMsg = messages[messages.length - 1];
  const isSuspectResponse = lastMsg?.sender === 'suspect';
  const isUnreadResponse = isSuspectResponse && lastMsg.id !== lastAcknowledgedId;
  const isSuspectTurn = isTyping || isUnreadResponse;

  useEffect(() => {
    if (isSuspectResponse && !isTyping && lastMsg) {
      if (displayedText === '' || !lastMsg.content.startsWith(displayedText.substring(0, 5))) {
         setDisplayedText(''); 
      }
      if (displayedText.length < lastMsg.content.length) {
        const timeoutId = setTimeout(() => {
          const nextChar = lastMsg.content.charAt(displayedText.length);
          setDisplayedText(prev => prev + nextChar);
          // Play sound for character speech effect
          playTypingSound();
        }, 30); 
        return () => clearTimeout(timeoutId);
      }
    } else if (!isSuspectResponse) {
        setDisplayedText('');
    }
  }, [displayedText, isSuspectResponse, isTyping, lastMsg]);

  useEffect(() => {
     if (isSuspectResponse && !isTyping && lastMsg && displayedText === '') {
         setDisplayedText(lastMsg.content.charAt(0));
     }
  }, [lastMsg, isSuspectResponse, isTyping]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showHistory]);

  return (
    <div className="h-screen w-full bg-[#020617] flex flex-col relative overflow-hidden font-sans">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <img 
            src="https://img.freepik.com/free-photo/empty-corridor-background_23-2149396112.jpg" 
            className="w-full h-full object-cover opacity-10 blur-sm mix-blend-luminosity"
            alt="Background"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950"></div>
         {/* Ambient Particles */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
      </div>

      {/* Header Controls */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex justify-between items-start">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <div className="p-2 rounded-full border border-slate-700 bg-slate-900/80 group-hover:border-red-500 transition-colors">
            <ArrowLeft size={18} /> 
          </div>
          <span className="text-sm font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">结束审讯</span>
        </button>
        
        <button 
           onClick={() => setShowHistory(!showHistory)}
           className="p-2 rounded-full border border-slate-700 bg-slate-900/80 text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-colors"
           title="查看审讯记录"
        >
           <History size={18} />
        </button>
      </div>

      {/* Character Stage - Dynamic Lighting & Breathing */}
      <div className="flex-1 flex items-end justify-center md:justify-between px-0 md:px-24 pb-48 md:pb-24 relative z-10 pointer-events-none h-full">
        
        {/* Detective (Left) */}
        <div className={`
            hidden md:block absolute left-10 bottom-0 transition-all duration-1000 transform origin-bottom
            ${!isSuspectTurn ? 'scale-105 z-20 brightness-110' : 'scale-95 z-10 brightness-[0.25] blur-[1px]'}
        `}>
            <div className={`
                absolute bottom-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent z-30
            `}></div>
            <img 
                src="https://img.freepik.com/free-vector/detective-holding-gun-illustration_1284-63309.jpg?size=626&ext=jpg" 
                alt="Detective"
                className="h-[65vh] object-cover animate-float"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)', animationDuration: '7s' }}
            />
        </div>

        {/* Suspect (Right/Center) */}
        <div className={`
            relative transition-all duration-1000 transform origin-bottom w-full md:w-auto flex justify-center md:block
            ${isSuspectTurn ? 'scale-110 md:scale-105 z-20 brightness-110' : 'scale-100 md:scale-95 z-10 brightness-[0.3] blur-[1px]'}
        `}>
             {/* Dynamic Spotlight */}
             <div className={`
                absolute -top-40 left-1/2 -translate-x-1/2 w-[150%] h-[150%] 
                bg-gradient-to-b from-red-500/10 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none
                transition-opacity duration-1000 ${isSuspectTurn ? 'opacity-100' : 'opacity-0'}
             `}></div>

             <div className={`absolute -top-20 right-0 md:-right-10 flex flex-col items-end opacity-0 transition-opacity duration-500 ${isSuspectTurn ? 'opacity-100' : ''}`}>
                <span className="text-red-500 font-black text-6xl opacity-10 font-serif">{suspect.name.charAt(0)}</span>
             </div>

            <img 
                src={getAvatarUrl(suspect)} 
                alt={suspect.name}
                className={`
                   h-[60vh] md:h-[70vh] object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]
                   animate-float
                `}
                style={{ animationDuration: '6s', maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
            />
        </div>
      </div>

      {/* Interaction Interface */}
      <div className="absolute bottom-0 w-full z-40 pt-20 pb-8 px-4 md:px-0 bg-gradient-to-t from-black via-black/95 to-transparent">
         <div className="max-w-4xl mx-auto w-full relative min-h-[180px] flex flex-col justify-end">
            
            {/* Suspect Dialogue Box */}
            {isSuspectTurn ? (
                <div className="animate-slide-up relative mx-2 md:mx-0">
                    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                        {/* Decorative Line */}
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-600"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                {suspect.name}
                            </div>
                            {isTyping && <Volume2 size={16} className="text-slate-500 animate-pulse" />}
                        </div>
                        
                        <div className="pr-12 min-h-[4rem]">
                            <p className="text-xl md:text-2xl text-slate-100 leading-relaxed font-serif tracking-wide">
                              {displayedText}
                              {displayedText.length < (lastMsg?.content.length || 0) && (
                                  <span className="inline-block w-2 h-5 bg-red-500 ml-1 animate-pulse align-middle shadow-[0_0_10px_rgba(220,38,38,0.8)]"></span>
                              )}
                            </p>
                        </div>

                         {!isTyping && (
                           <button 
                              onClick={handleContinue}
                              className="absolute bottom-6 right-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                           >
                              <span className="text-xs font-bold uppercase tracking-widest">
                                  {displayedText.length < (lastMsg?.content.length || 0) ? "跳过" : "继续"}
                              </span>
                              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                         )}
                    </div>
                </div>
            ) : (
                /* User Choices UI */
                <div className="flex flex-col md:flex-row gap-6 items-end animate-slide-up mx-2 md:mx-0">
                    
                    {/* Fixed Options */}
                    <div className="flex-1 w-full grid grid-cols-1 gap-3">
                        {activeQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(q)}
                                className="text-left bg-slate-900/60 hover:bg-slate-800/90 border border-slate-700 hover:border-amber-600/50 backdrop-blur-md p-4 rounded-lg transition-all duration-200 group flex items-center gap-4 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-amber-600/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                                <span className="text-slate-500 font-mono text-xs font-bold group-hover:text-amber-500">0{idx + 1}</span>
                                <span className="font-sans text-slate-200 text-base md:text-lg tracking-wide group-hover:text-white">{q}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="w-full md:w-1/3 bg-slate-900/90 p-1 rounded-xl border border-slate-700 backdrop-blur-xl shadow-xl">
                         <form onSubmit={handleSubmit} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="自定义询问..."
                                className="w-full bg-transparent text-slate-200 px-4 py-4 focus:outline-none placeholder-slate-600 font-medium"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim()}
                                className="p-3 mr-1 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all disabled:opacity-0"
                            >
                                <Send size={18} />
                            </button>
                         </form>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* History Overlay */}
      {showHistory && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-2xl border border-slate-700 flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-serif text-2xl text-slate-100 tracking-wide">审讯记录</h3>
                      <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-8" ref={scrollRef}>
                      {messages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 px-2 py-0.5 rounded ${msg.sender === 'user' ? 'bg-amber-900/30 text-amber-500' : 'bg-red-900/30 text-red-500'}`}>
                                  {msg.sender === 'user' ? '侦探' : suspect.name}
                              </span>
                              <div className={`max-w-[85%] text-base leading-relaxed ${
                                  msg.sender === 'user' 
                                  ? 'text-slate-300 text-right' 
                                  : 'text-white font-serif'
                              }`}>
                                  {msg.content}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};