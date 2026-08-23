import React, { useState } from 'react';
import { CVData } from '../types';
import { Loader2, Sparkles, Building2, Briefcase, Download, Printer } from 'lucide-react';
import Markdown from 'react-markdown';

interface CoverLetterProps {
  data: CVData;
}

export default function CoverLetter({ data }: CoverLetterProps) {
  const [targetJob, setTargetJob] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [letterContent, setLetterContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!targetJob || !targetCompany) {
      alert("Por favor, ingresa el puesto y la empresa objetivo.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvData: data, targetJob, targetCompany })
      });
      const result = await response.json();
      if (result.text) {
        setLetterContent(result.text);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al generar la carta.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 h-full">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm no-print">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          Redactor de Carta de Presentación con IA
        </h2>
        <p className="text-slate-600 mb-6 text-sm">
          Ingresa los detalles del puesto al que te postulas y la IA redactará un borrador profesional utilizando los datos de tu currículum.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Briefcase className="w-4 h-4 text-slate-400" /> Puesto Objetivo
            </label>
            <input
              type="text"
              value={targetJob}
              onChange={(e) => setTargetJob(e.target.value)}
              placeholder="Ej. Desarrollador Frontend Senior"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Building2 className="w-4 h-4 text-slate-400" /> Empresa Objetivo
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="Ej. Google, Amazon, Startup Tech..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
            />
          </div>
        </div>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !targetJob || !targetCompany}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {letterContent ? 'Regenerar Carta' : 'Generar Carta'}
          </button>
        </div>
      </div>

      {letterContent && (
        <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-lg print:shadow-none print:border-none flex-1 font-serif text-slate-800 leading-relaxed print-exact mx-auto w-full max-w-[210mm] min-h-[297mm]">
          <div className="flex justify-between items-center mb-10 no-print">
            <h3 className="text-lg font-bold text-slate-300">Borrador de Carta</h3>
            <button
              onClick={handlePrint}
              className="text-slate-600 hover:text-indigo-600 flex items-center gap-1 text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4" /> Imprimir
            </button>
          </div>
          
          <div className="whitespace-pre-wrap outline-none" contentEditable suppressContentEditableWarning>
            {letterContent}
          </div>
        </div>
      )}
    </div>
  );
}
