import React, { useState, useEffect, useRef } from 'react';
import { Suspect, Message, Difficulty } from '../types';
import { ArrowLeft, Send, History, MessageSquare, ChevronRight, Mic } from 'lucide-react';

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

  // Question Pool
  const questionPool = [
    "你最后一次见到死者是什么时候？",
    "案发当晚10点，你在哪里？",
    "你好像隐瞒了什么秘密？",
    "你和死者生前发生过争执吗？",
    "对于案发现场的凶器，你有什么头绪？",
    "有人看到你案发时出现在附近。"
  ];

  // Determine number of questions based on difficulty
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
    
    const style = suspect.avatarStyle;
    if (!style) return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
    const s = style.toLowerCase();
    if (s.includes('butler')) return 'https://img.freepik.com/free-photo/portrait-senior-man-wearing-suit_23-2148943825.jpg?auto=format&fit=crop&w=500&q=80';
    if (s.includes('lady')) return 'https://img.freepik.com/free-photo/portrait-young-woman-with-long-hair_23-2148943809.jpg?auto=format&fit=crop&w=500&q=80';
    if (s.includes('driver')) return 'https://img.freepik.com/free-photo/portrait-handsome-man-black-shirt_23-2148943799.jpg?auto=format&fit=crop&w=500&q=80';
    return 'https://img.freepik.com/free-vector/mysterious-mafia-man-smoking-cigarette_52683-34828.jpg';
  };

  const handleOptionClick = (text: string) => {
    if (!isTyping) {
      onSendMessage(text);
    }
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
    if (lastMsg) {
      setLastAcknowledgedId(lastMsg.id);
    }
  };

  // Turn Logic
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
          setDisplayedText(lastMsg.content.slice(0, displayedText.length + 1));
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
    <div className="h-screen w-full bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://img.freepik.com/free-photo/empty-corridor-background_23-2149396112.jpg" 
            className="w-full h-full object-cover opacity-20 blur-sm"
            alt="Background"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-900"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900/80 px-5 py-2 rounded-lg border border-slate-700 hover:border-amber-600 transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft size={18} /> <span className="text-sm font-bold tracking-wider">返回现场</span>
        </button>
        
        <button 
           onClick={() => setShowHistory(!showHistory)}
           className="flex items-center gap-2 text-slate-300 hover:text-white bg-slate-900/80 px-5 py-2 rounded-lg border border-slate-700 hover:border-amber-600 transition-all backdrop-blur-md shadow-lg"
        >
           <History size={18} /> <span className="text-sm font-bold tracking-wider">审讯记录</span>
        </button>
      </div>

      {/* Character Stage */}
      <div className="flex-1 flex items-end justify-between px-4 md:px-20 pb-48 md:pb-32 relative z-10 pointer-events-none">
        
        {/* Detective */}
        <div className={`
            relative transition-all duration-700 transform origin-bottom-left
            ${!isSuspectTurn ? 'scale-105 brightness-110 z-20' : 'scale-95 grayscale brightness-50 z-10'}
        `}>
            <div className={`absolute -top-12 left-0 bg-amber-900/90 text-amber-100 px-6 py-1 text-sm font-bold tracking-[0.2em] skew-x-[-10deg] border-l-4 border-amber-500 shadow-lg transition-opacity duration-300 ${!isSuspectTurn ? 'opacity-100' : 'opacity-0'}`}>
                我方侦探
            </div>
            <img 
                src="https://img.freepik.com/free-vector/detective-holding-gun-illustration_1284-63309.jpg?size=626&ext=jpg" 
                alt="Detective"
                className="h-[50vh] md:h-[70vh] object-cover drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] mask-image-gradient"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
            />
        </div>

        {/* Suspect */}
        <div className={`
            relative transition-all duration-700 transform origin-bottom-right
            ${isSuspectTurn ? 'scale-105 brightness-110 z-20' : 'scale-95 grayscale brightness-50 z-10'}
        `}>
             <div className={`absolute -top-12 right-0 bg-red-900/90 text-red-100 px-6 py-1 text-sm font-bold tracking-[0.2em] skew-x-[10deg] border-r-4 border-red-500 shadow-lg transition-opacity duration-300 ${isSuspectTurn ? 'opacity-100' : 'opacity-0'}`}>
                {suspect.name}
            </div>
            <img 
                src={getAvatarUrl(suspect)} 
                alt={suspect.name}
                className="h-[50vh] md:h-[70vh] object-cover drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            />
        </div>
      </div>

      {/* Interaction Layer */}
      <div className="absolute bottom-0 w-full z-40 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-20 pb-6 px-4 md:px-0">
         <div className="max-w-5xl mx-auto w-full relative min-h-[200px] flex flex-col justify-end">
            
            {/* Suspect Dialogue Box */}
            {isSuspectTurn ? (
                <div className="bg-slate-900/95 border-l-4 border-red-600 rounded-r-xl p-6 md:p-8 min-h-[160px] backdrop-blur-md shadow-2xl animate-fade-in relative mx-4 md:mx-0 ring-1 ring-white/5">
                    <div className="absolute -top-4 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-r shadow-lg">
                        {suspect.name} · {suspect.role}
                    </div>
                    
                    <div className="pr-12">
                      {isTyping ? (
                          <div className="flex items-center gap-2 text-slate-400 italic text-lg py-2">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></span>
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></span>
                              <span className="ml-2 font-serif">正在思考...</span>
                          </div>
                      ) : (
                          <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-serif tracking-wide min-h-[3rem]">
                              <span className="text-red-500/50 text-2xl mr-2">“</span>
                              {displayedText}
                              {displayedText.length < (lastMsg?.content.length || 0) && (
                                  <span className="inline-block w-2 h-5 bg-red-500 ml-1 animate-pulse align-middle"></span>
                              )}
                              {displayedText.length === (lastMsg?.content.length || 0) && (
                                <span className="text-red-500/50 text-2xl ml-2">”</span>
                              )}
                          </p>
                      )}
                    </div>

                     {!isTyping && (
                       <button 
                          onClick={handleContinue}
                          className="absolute bottom-4 right-4 flex items-center gap-2 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-red-900 hover:to-red-800 text-slate-200 hover:text-white px-5 py-2 rounded-lg border border-slate-600 hover:border-red-500 transition-all group pointer-events-auto shadow-lg"
                       >
                          <span className="text-sm font-bold">
                              {displayedText.length < (lastMsg?.content.length || 0) ? "跳过" : "继续追问"}
                          </span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                     )}
                </div>
            ) : (
                /* User Choices UI */
                <div className="flex flex-col md:flex-row gap-6 items-end animate-fade-in mx-4 md:mx-0">
                    
                    {/* Fixed Options */}
                    <div className="flex-1 w-full space-y-3 pointer-events-auto">
                        <div className="flex items-center gap-2 mb-2 pl-1">
                            <span className="bg-amber-600 w-2 h-2 rounded-full animate-pulse"></span>
                            <span className="text-amber-500 text-xs font-bold tracking-widest">
                                选择审讯话题 ({difficulty})
                            </span>
                        </div>
                        {activeQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(q)}
                                className="w-full text-left bg-slate-800/80 hover:bg-slate-700/90 border-l-4 border-slate-600 hover:border-amber-500 text-slate-300 hover:text-white p-4 transition-all duration-200 group relative overflow-hidden shadow-lg backdrop-blur-sm rounded-r-lg"
                            >
                                <span className="text-slate-500 font-mono mr-4 text-sm font-bold group-hover:text-amber-500 transition-colors">0{idx + 1}</span>
                                <span className="font-serif text-lg tracking-wide">{q}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="w-full md:w-1/3 bg-slate-900/90 p-5 rounded-t-xl border border-slate-700 border-b-0 backdrop-blur-md pointer-events-auto shadow-2xl">
                         <div className="text-slate-500 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                             <Mic size={12} /> 自由询问
                         </div>
                         <form onSubmit={handleSubmit} className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="输入你的问题..."
                                className="w-full bg-black/40 border-b-2 border-slate-600 text-slate-200 px-4 py-3 focus:outline-none focus:border-amber-500 focus:bg-black/60 transition-all rounded-t placeholder-slate-600"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim()}
                                className="absolute right-2 top-2 text-slate-500 hover:text-amber-500 disabled:opacity-0 transition-all p-1"
                            >
                                <Send size={20} />
                            </button>
                         </form>
                    </div>
                </div>
            )}
         </div>
      </div>

      {/* History Modal */}
      {showHistory && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-xl border border-slate-700 flex flex-col shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-50"></div>
                  <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                      <h3 className="font-serif text-xl text-slate-200 tracking-wide">审讯笔录</h3>
                      <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white transition-colors">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                      {messages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <span className="text-[10px] text-slate-500 mb-1 font-bold uppercase tracking-wider px-1">
                                  {msg.sender === 'user' ? '侦探' : suspect.name}
                              </span>
                              <div className={`max-w-[85%] p-4 rounded-xl text-sm leading-relaxed shadow-md ${
                                  msg.sender === 'user' 
                                  ? 'bg-amber-900/20 text-amber-100 border border-amber-900/50 rounded-tr-none' 
                                  : 'bg-slate-800 text-slate-300 border border-slate-700 rounded-tl-none'
                              }`}>
                                  {msg.content}
                              </div>
                          </div>
                      ))}
                      {messages.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-slate-600">
                              <MessageSquare size={40} className="mb-4 opacity-20" />
                              <p className="italic">暂无审讯记录</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};