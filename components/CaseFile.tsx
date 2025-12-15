import React from 'react';
import { CaseData } from '../types';
import { FileText, AlertCircle, HelpCircle } from 'lucide-react';

interface CaseFileProps {
  caseData: CaseData;
  onSolve: () => void;
}

export const CaseFile: React.FC<CaseFileProps> = ({ caseData, onSolve }) => {
  return (
    <div className="h-full bg-[#fdfbf7] text-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col relative border-4 border-slate-200">
      {/* Paper texture overlay effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-repeat" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper.png")' }}></div>
      
      <div className="bg-slate-900 p-4 text-white flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <FileText className="text-amber-500" />
          <h2 className="font-serif text-xl font-bold tracking-wider">CASE FILE #{(Math.random() * 1000).toFixed(0)}</h2>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded ${
          caseData.difficulty === 'Hard' ? 'bg-red-900 text-red-100' : 
          caseData.difficulty === 'Medium' ? 'bg-amber-800 text-amber-100' : 'bg-green-900 text-green-100'
        }`}>
          {caseData.difficulty.toUpperCase()}
        </span>
      </div>

      <div className="p-6 md:p-8 overflow-y-auto flex-1 z-10 font-serif">
        <div className="border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{caseData.title}</h1>
          <div className="flex gap-4 text-sm text-slate-600 italic">
            <span>Theme: {caseData.theme}</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800 uppercase tracking-widest border-l-4 border-amber-600 pl-3 mb-4">
            <AlertCircle size={20} className="text-amber-600" />
            Incident Report
          </h3>
          <p className="text-lg leading-relaxed text-slate-800 whitespace-pre-wrap">
            {caseData.introduction}
          </p>

          <div className="my-8 p-4 bg-slate-100 border border-slate-300 rounded text-sm text-slate-600 italic">
            <h4 className="font-bold text-slate-700 not-italic mb-1 flex items-center gap-2">
               <HelpCircle size={14} /> Detective's Note
            </h4>
            Use the chat interface to interrogate the Game Master. Ask yes/no questions or ask for details about the scene. When you are confident you know the truth, click the Solve Case button below.
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-100 border-t border-slate-300 z-10">
        <button
          onClick={onSolve}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded shadow-lg transform transition hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
        >
          <span className="text-amber-500 text-xl">★</span> SOLVE CASE
        </button>
      </div>
    </div>
  );
};