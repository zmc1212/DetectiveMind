import React, { useRef, useEffect, useState } from 'react';
import { Message } from '../types';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isTyping }) => {
  const [input, setInput] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="font-serif text-xl text-slate-200 tracking-wide">Investigation Log</h3>
        <div className="text-xs text-slate-400 uppercase tracking-widest">Live Feed</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 italic mt-10">
            The investigation begins. Ask questions to uncover the truth...
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.sender === 'user' ? 'bg-amber-600' : 'bg-slate-600'}
            `}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`
              max-w-[80%] p-3 rounded-lg text-sm leading-relaxed
              ${msg.sender === 'user' 
                ? 'bg-amber-900/40 text-amber-100 border border-amber-800/50 rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'}
            `}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800 p-3 rounded-lg rounded-tl-none border border-slate-700">
              <Loader2 className="animate-spin text-slate-400" size={16} />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="bg-slate-800 p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the case..."
            className="flex-1 bg-slate-900 text-slate-100 border border-slate-600 rounded-md px-4 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-medium"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};