import React, { useState, useEffect, useRef } from 'react';
import { Suspect, Message, Difficulty } from '../types';
import { ArrowLeft, Send, History, ChevronRight, Volume2 } from 'lucide-react';
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
            src="https://img.freepik.com/free-photo/dark-empty-room-with-concrete-floor_158538-20894.jpg" 
            className="w-full h-full object-cover opacity-60"
            alt="Interrogation Room"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
         {/* Dust Particles */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse-slow"></div>
      </div>

      {/* Header Controls */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <div className="p-2 rounded-full border border-slate-700 bg-black/60 backdrop-blur-md group-hover:border-red-500 transition-colors">
            <ArrowLeft size={16} /> 
          </div>
          <span className="text-xs font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
            返回现场
          </span>
        </button>
        
        <button 
           onClick={() => setShowHistory(!showHistory)}
           className="p-2 rounded-full border border-slate-700 bg-black/60 backdrop-blur-md text-slate-400 hover:text-amber-500 hover:border-amber-500 transition-colors"
           title="查看审讯记录"
        >
           <History size={16} />
        </button>
      </div>

      {/* Character Stage - Absolute Positioning for strict Left/Right layout */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        
        {/* Detective (Left) */}
        <div className={`
            absolute bottom-0 left-[-5%] md:left-[2%] transition-all duration-700 transform origin-bottom-left
            ${!isSuspectTurn ? 'z-20 brightness-110 scale-[1.02]' : 'z-10 brightness-[0.4] scale-100 blur-[1px]'}
        `}>
            <img 
                src="https://img.freepik.com/free-vector/detective-holding-gun-illustration_1284-63309.jpg?size=626&ext=jpg" 
                alt="Detective"
                className="h-[65vh] md:h-[85vh] w-auto object-cover object-top drop-shadow-[10px_0_30px_rgba(0,0,0,0.8)]"
            />
        </div>

        {/* Suspect (Right) */}
        <div className={`
            absolute bottom-0 right-[-5%] md:right-[2%] transition-all duration-700 transform origin-bottom-right
            ${isSuspectTurn ? 'z-20 brightness-110 scale-[1.02]' : 'z-10 brightness-[0.4] scale-100 blur-[1px]'}
        `}>
            {/* Suspect Name Tag (Floating) */}
             <div className={`absolute bottom-[40vh] -left-10 bg-red-900/90 text-red-100 px-4 py-1 text-xs font-bold tracking-widest skew-x-[10deg] border-r-2 border-red-500 shadow-lg transition-opacity duration-300 ${isSuspectTurn ? 'opacity-100' : 'opacity-0'}`}>
                {suspect.name}
            </div>

            <img 
                src={getAvatarUrl(suspect)} 
                alt={suspect.name}
                className="h-[65vh] md:h-[85vh] w-auto object-cover object-top drop-shadow-[-10px_0_30px_rgba(0,0,0,0.8)] mask-image-gradient"
                style={{ maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)' }}
            />
        </div>
      </div>

      {/* Interaction Interface - Centered and Compact */}
      <div className="absolute bottom-0 w-full z-40 px-4 pb-8 flex justify-center items-end bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
         <div className="w-full max-w-2xl relative min-h-[140px] flex flex-col justify-end">
            
            {/* Suspect Dialogue Box */}
            {isSuspectTurn ? (
                <div className="animate-slide-up relative">
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-sm p-5 shadow-2xl relative">
                        {/* Speaker Label */}
                        <div className="absolute -top-3 left-4 bg-red-700 text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-widest">
                            {suspect.name} SPEAKING
                        </div>
                        
                        <div className="pr-8">
                            <p className="text-lg text-slate-200 leading-relaxed font-serif tracking-wide">
                              {displayedText}
                              {displayedText.length < (lastMsg?.content.length || 0) && (
                                  <span className="inline-block w-1.5 h-4 bg-red-500 ml-1 animate-pulse align-middle"></span>
                              )}
                            </p>
                        </div>

                         {!isTyping && (
                           <button 
                              onClick={handleContinue}
                              className="absolute bottom-3 right-3 flex items-center gap-1 text-slate-500 hover:text-white transition-colors group"
                           >
                              <span className="text-[10px] font-bold uppercase tracking-widest">
                                  {displayedText.length < (lastMsg?.content.length || 0) ? "跳过" : "继续"}
                              </span>
                              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                         )}
                    </div>
                </div>
            ) : (
                /* User Choices UI - Vertical List Style */
                <div className="animate-slide-up space-y-2">
                    {/* Detective Label */}
                    <div className="flex items-center gap-2 mb-1 pl-1 opacity-70">
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-950/50 px-2 py-0.5 border border-amber-900 rounded-sm tracking-widest uppercase">
                            DETECTIVE
                        </span>
                    </div>

                    <div className="flex flex-col gap-2">
                        {activeQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(q)}
                                className="w-full text-left bg-black/60 hover:bg-red-950/40 border-l-[3px] border-slate-600 hover:border-red-600 backdrop-blur-sm py-3 px-4 transition-all duration-200 group flex items-center gap-4 relative overflow-hidden"
                            >
                                <span className="text-red-600/50 font-mono text-xs font-bold group-hover:text-red-500 transition-colors">
                                    0{idx + 1}
                                </span>
                                <span className="font-sans text-slate-300 text-sm font-medium tracking-wide group-hover:text-white truncate">
                                    {q}
                                </span>
                            </button>
                        ))}
                        
                        {/* Custom Input Compact */}
                        <div className="bg-black/60 border-l-[3px] border-slate-700 focus-within:border-amber-600 flex items-center pr-2 transition-colors">
                             <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="输入自定义问题..."
                                className="w-full bg-transparent text-slate-200 px-4 py-3 text-sm focus:outline-none placeholder-slate-600 font-medium"
                            />
                            <button 
                                onClick={handleSubmit}
                                disabled={!input.trim()}
                                className="p-1.5 text-slate-500 hover:text-white transition-colors disabled:opacity-0"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* History Overlay */}
      {showHistory && (
          <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 w-full max-w-2xl h-[70vh] rounded-sm border border-slate-700 flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                      <h3 className="font-serif text-lg text-slate-100 tracking-wide">审讯笔录</h3>
                      <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                      {messages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 px-1.5 py-0.5 rounded ${msg.sender === 'user' ? 'bg-amber-900/30 text-amber-500' : 'bg-red-900/30 text-red-500'}`}>
                                  {msg.sender === 'user' ? '侦探' : suspect.name}
                              </span>
                              <div className={`max-w-[85%] text-sm leading-relaxed p-2 rounded ${
                                  msg.sender === 'user' 
                                  ? 'bg-slate-800 text-slate-300' 
                                  : 'bg-black/40 text-slate-400 font-serif border-l-2 border-red-900'
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