import React, { useState, useEffect, useRef } from 'react';
import { Suspect, Message } from '../types';
import { ArrowLeft, Send, History, MessageSquare, ChevronRight } from 'lucide-react';

interface InterrogationViewProps {
  suspect: Suspect;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  isTyping: boolean;
}

export const InterrogationView: React.FC<InterrogationViewProps> = ({ 
  suspect, 
  messages, 
  onSendMessage, 
  onBack, 
  isTyping 
}) => {
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [lastAcknowledgedId, setLastAcknowledgedId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState(''); // State for typewriter effect
  const scrollRef = useRef<HTMLDivElement>(null);

  // Preset questions usually available in detective games
  const defaultQuestions = [
    "你最后一次见到死者是什么时候？",
    "案发当晚10点，你在哪里？",
    "你好像隐瞒了什么秘密？"
  ];

  const getAvatarUrl = (style?: string) => {
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
    // If text hasn't finished typing, finish it immediately
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

  // Typewriter Effect
  useEffect(() => {
    if (isSuspectResponse && !isTyping && lastMsg) {
      // If we are showing a new message, reset and start typing
      if (displayedText === '' || !lastMsg.content.startsWith(displayedText.substring(0, 5))) {
         setDisplayedText(''); 
      }
      
      if (displayedText.length < lastMsg.content.length) {
        const timeoutId = setTimeout(() => {
          setDisplayedText(lastMsg.content.slice(0, displayedText.length + 1));
        }, 30); // Speed of typing
        return () => clearTimeout(timeoutId);
      }
    } else if (!isSuspectResponse) {
        setDisplayedText('');
    }
  }, [displayedText, isSuspectResponse, isTyping, lastMsg]);

  // If we revisit a message that was already fully typed or logic reset, ensure it shows full if it's the current one
  useEffect(() => {
     if (isSuspectResponse && !isTyping && lastMsg && displayedText === '') {
         // Initial trigger
         setDisplayedText(lastMsg.content.charAt(0));
     }
  }, [lastMsg, isSuspectResponse, isTyping]);


  // Auto scroll history
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showHistory]);

  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col relative overflow-hidden font-sans">
      {/* 1. Atmospheric Background */}
      <div className="absolute inset-0 z-0">
         <img 
            src="https://img.freepik.com/free-photo/empty-corridor-background_23-2149396112.jpg" 
            className="w-full h-full object-cover opacity-30 blur-sm"
            alt="Background"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900"></div>
      </div>

      {/* 2. Header (Back & Info) */}
      <div className="absolute top-0 left-0 w-full p-4 z-50 flex justify-between items-start">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 transition-colors backdrop-blur-md"
        >
          <ArrowLeft size={18} /> <span className="text-sm font-bold">返回现场</span>
        </button>
        
        <button 
           onClick={() => setShowHistory(!showHistory)}
           className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700 transition-colors backdrop-blur-md"
        >
           <History size={18} /> <span className="text-sm font-bold">审讯记录</span>
        </button>
      </div>

      {/* 3. Character Stage */}
      <div className="flex-1 flex items-end justify-between px-4 md:px-20 pb-48 md:pb-32 relative z-10 pointer-events-none">
        
        {/* Left: Detective (User) */}
        <div className={`
            relative transition-all duration-700 transform origin-bottom-left
            ${!isSuspectTurn ? 'scale-105 brightness-110 z-20' : 'scale-95 grayscale brightness-50 z-10'}
        `}>
            <div className={`absolute -top-12 left-0 bg-amber-900/90 text-amber-100 px-4 py-1 text-sm font-bold tracking-widest uppercase skew-x-[-10deg] border-l-4 border-amber-500 shadow-lg transition-opacity duration-300 ${!isSuspectTurn ? 'opacity-100' : 'opacity-0'}`}>
                DETECTIVE
            </div>
            <img 
                src="https://img.freepik.com/free-vector/detective-holding-gun-illustration_1284-63309.jpg?size=626&ext=jpg" 
                alt="Detective"
                className="h-[50vh] md:h-[70vh] object-cover drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] mask-image-gradient"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
            />
        </div>

        {/* Right: Suspect */}
        <div className={`
            relative transition-all duration-700 transform origin-bottom-right
            ${isSuspectTurn ? 'scale-105 brightness-110 z-20' : 'scale-95 grayscale brightness-50 z-10'}
        `}>
             <div className={`absolute -top-12 right-0 bg-red-900/90 text-red-100 px-4 py-1 text-sm font-bold tracking-widest uppercase skew-x-[10deg] border-r-4 border-red-500 shadow-lg transition-opacity duration-300 ${isSuspectTurn ? 'opacity-100' : 'opacity-0'}`}>
                {suspect.name}
            </div>
            <img 
                src={getAvatarUrl(suspect.avatarStyle)} 
                alt={suspect.name}
                className="h-[50vh] md:h-[70vh] object-cover drop-shadow-[0_0_30px_rgba(0,0,0,0.8)]"
            />
        </div>
      </div>

      {/* 4. Dialogue / Interaction Layer */}
      <div className="absolute bottom-0 w-full z-40 bg-gradient-to-t from-slate-950 via-slate-900 to-transparent pt-20 pb-6 px-4 md:px-0">
         <div className="max-w-5xl mx-auto w-full relative min-h-[200px] flex flex-col justify-end">
            
            {/* If Suspect is speaking or typing, show Dialogue Box */}
            {isSuspectTurn ? (
                <div className="bg-slate-900/90 border-l-4 border-red-600 rounded-r-lg p-6 md:p-8 min-h-[160px] backdrop-blur-md shadow-2xl animate-fade-in relative mx-4 md:mx-0">
                    <div className="absolute -top-6 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                        {suspect.name} ({suspect.role})
                    </div>
                    
                    <div className="pr-12">
                      {isTyping ? (
                          <div className="flex items-center gap-2 text-slate-400 italic text-lg">
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-100"></span>
                              <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce delay-200"></span>
                              思考中...
                          </div>
                      ) : (
                          <p className="text-lg md:text-xl text-slate-200 leading-relaxed font-serif tracking-wide min-h-[3rem]">
                              {/* Typewriter Display */}
                              {displayedText}
                              {displayedText.length < (lastMsg?.content.length || 0) && (
                                  <span className="inline-block w-2 h-5 bg-red-500 ml-1 animate-pulse align-middle"></span>
                              )}
                          </p>
                      )}
                    </div>

                     {/* Continue Button */}
                     {!isTyping && (
                       <button 
                          onClick={handleContinue}
                          className="absolute bottom-4 right-4 flex items-center gap-2 bg-slate-800 hover:bg-red-900 text-slate-300 hover:text-white px-4 py-2 rounded border border-slate-700 hover:border-red-500 transition-all group pointer-events-auto"
                       >
                          <span className="text-sm font-bold">
                              {displayedText.length < (lastMsg?.content.length || 0) ? "跳过" : "继续"}
                          </span>
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                       </button>
                     )}
                </div>
            ) : (
                /* User Turn: Choices UI */
                <div className="flex flex-col md:flex-row gap-6 items-end animate-fade-in mx-4 md:mx-0">
                    
                    {/* Fixed Options */}
                    <div className="flex-1 w-full space-y-3 pointer-events-auto">
                        <div className="flex items-center gap-2 mb-2 pl-1">
                            <span className="bg-amber-600 w-2 h-2 rounded-full animate-pulse"></span>
                            <span className="text-amber-500 text-xs font-bold uppercase tracking-widest">
                                选择审讯话题 (DETECTIVE)
                            </span>
                        </div>
                        {defaultQuestions.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(q)}
                                className="w-full text-left bg-slate-800/90 hover:bg-slate-700/90 border-l-4 border-slate-600 hover:border-amber-500 text-slate-300 hover:text-white p-4 transition-all duration-200 group relative overflow-hidden shadow-lg backdrop-blur-sm"
                            >
                                <span className="text-slate-500 font-mono mr-4 text-sm font-bold group-hover:text-amber-500 transition-colors">0{idx + 1}</span>
                                <span className="font-serif text-lg tracking-wide">{q}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Input */}
                    <div className="w-full md:w-1/3 bg-slate-900/80 p-4 rounded-t-lg border border-slate-700 border-b-0 backdrop-blur-md pointer-events-auto">
                         <div className="text-slate-500 text-xs font-bold uppercase mb-2">自定义询问</div>
                         <form onSubmit={handleSubmit} className="relative group">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="输入问题..."
                                className="w-full bg-black/40 border-b-2 border-slate-600 text-slate-200 px-4 py-3 focus:outline-none focus:border-amber-500 focus:bg-black/60 transition-all rounded-t"
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

      {/* 5. History Overlay Modal */}
      {showHistory && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 w-full max-w-2xl h-[80vh] rounded-lg border border-slate-700 flex flex-col shadow-2xl animate-fade-in">
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                      <h3 className="font-serif text-xl text-slate-200">审讯记录</h3>
                      <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                      {messages.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <span className="text-xs text-slate-500 mb-1 font-bold uppercase">{msg.sender === 'user' ? 'Detective' : suspect.name}</span>
                              <div className={`max-w-[80%] p-4 rounded-lg text-sm leading-relaxed shadow-md ${msg.sender === 'user' ? 'bg-amber-900/20 text-amber-100 border border-amber-900/50' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                  {msg.content}
                              </div>
                          </div>
                      ))}
                      {messages.length === 0 && (
                          <div className="text-center text-slate-500 italic mt-10">暂无记录</div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};