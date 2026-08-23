import { useState } from 'react';
import Landing from './components/Landing';
import Editor from './components/Editor';
import Preview from './components/Preview';
import CoverLetter from './components/CoverLetter';
import { CVData, initialCVData } from './types';
import { Download, ArrowLeft, Printer, Upload, Save, FileText, Mail } from 'lucide-react';

export default function App() {
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeTab, setActiveTab] = useState<'cv' | 'cover-letter'>('cv');
  const [cvData, setCvData] = useState<CVData>(initialCVData);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(cvData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'curriculum.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (importedData && typeof importedData === 'object' && importedData.personalInfo) {
          setCvData(importedData);
        } else {
          alert("El archivo JSON no es válido para este creador de currículums.");
        }
      } catch (error) {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  if (!isBuilding) {
    return <Landing onStart={() => setIsBuilding(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar (Hidden when printing) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 no-print shadow-sm overflow-x-auto">
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setIsBuilding(false)}
            className="text-slate-500 hover:text-slate-900 transition-colors p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer"
            title="Volver al inicio"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Creador de CV</h1>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <input type="file" accept=".json" id="import-json" className="hidden" onChange={handleImportJSON} />
          <label htmlFor="import-json" className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm">
            <Upload className="w-4 h-4" /> Importar JSON
          </label>
          <button onClick={handleExportJSON} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors inline-flex items-center gap-2 shadow-sm">
            <Save className="w-4 h-4" /> Guardar Progreso
          </button>
          <button 
            onClick={handlePrint}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm ml-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden no-print">
        {/* Editor Sidebar */}
        <div className="w-full lg:w-[45%] xl:w-[40%] bg-slate-50 border-r border-slate-200 overflow-y-auto h-[calc(100vh-73px)]">
          <Editor data={cvData} onChange={setCvData} />
        </div>
        
        {/* Live Preview Panel */}
        <div className="w-full lg:w-[55%] xl:w-[60%] bg-slate-200/50 p-6 md:p-8 overflow-y-auto h-[calc(100vh-73px)] flex flex-col items-center">
          
          {/* Tabs for CV or Cover Letter */}
          <div className="flex bg-slate-200 p-1 rounded-lg mb-6 w-full max-w-sm shrink-0">
            <button
              onClick={() => setActiveTab('cv')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'cv' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/50'
              }`}
            >
              <FileText className="w-4 h-4" /> Currículum
            </button>
            <button
              onClick={() => setActiveTab('cover-letter')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'cover-letter' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800 hover:bg-slate-300/50'
              }`}
            >
              <Mail className="w-4 h-4" /> Carta
            </button>
          </div>

          <div className="w-full flex-1 flex justify-center items-start">
            {activeTab === 'cv' ? <Preview data={cvData} /> : <CoverLetter data={cvData} />}
          </div>
        </div>
      </main>

      {/* Print-Only Area */}
      <div className="hidden print-only">
        {activeTab === 'cv' ? <Preview data={cvData} /> : <CoverLetter data={cvData} />}
      </div>
    </div>
  );
}

