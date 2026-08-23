import { FileText, Edit3, Download, ArrowRight } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-24 pb-12 px-4 no-print">
      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
          Crea tu Currículum Profesional
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Plantillas de CV optimizadas, fáciles de editar y listas para descargar en PDF.
          Destaca entre los candidatos y consigue el trabajo que deseas.
        </p>
        <div className="pt-8">
          <button
            onClick={onStart}
            className="bg-slate-900 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            Crear mi CV ahora <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-24 grid md:grid-cols-3 gap-12 max-w-5xl w-full">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">1. Elige una plantilla</h3>
          <p className="text-slate-600">Diseños profesionales y modernos que se adaptan a tu sector y experiencia.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center mb-6">
            <Edit3 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">2. Rellena tus datos</h3>
          <p className="text-slate-600">Interfaz fácil de usar para añadir tu experiencia, estudios y habilidades.</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-6">
            <Download className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">3. Descarga en PDF</h3>
          <p className="text-slate-600">Exporta tu currículum al instante, listo para enviar o imprimir.</p>
        </div>
      </div>
    </div>
  );
}
