import React, { useState, useRef } from 'react';
import { CVData, Theme } from '../types';
import { Plus, Trash2, Sparkles, Loader2, Image as ImageIcon, X, ArrowUp, ArrowDown, SpellCheck } from 'lucide-react';

interface EditorProps {
  data: CVData;
  onChange: (data: CVData) => void;
}

export default function Editor({ data, onChange }: EditorProps) {
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [generatingExpId, setGeneratingExpId] = useState<string | null>(null);
  const [checkingGrammarId, setCheckingGrammarId] = useState<string | null>(null);
  const [skillKeyword, setSkillKeyword] = useState('');
  const [suggestedSkills, setSuggestedSkills] = useState<string[]>([]);
  const [isSuggestingSkills, setIsSuggestingSkills] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestedSkills = async (keyword: string) => {
    setIsSuggestingSkills(true);
    try {
      const res = await fetch('/api/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector: data.personalInfo.jobTitle || 'General',
          keyword
        })
      });
      const json = await res.json();
      if (json.skills) setSuggestedSkills(json.skills);
    } catch (e) {
      console.error(e);
      alert("Error al obtener sugerencias de habilidades.");
    } finally {
      setIsSuggestingSkills(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updatePersonalInfo('photo', '');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateTheme = (theme: Theme) => {
    onChange({ ...data, theme });
  };

  const handleCheckGrammar = async (id: string, text: string, onUpdate: (corrected: string) => void) => {
    if (!text) return;
    setCheckingGrammarId(id);
    try {
      const response = await fetch('/api/check-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const result = await response.json();
      if (result.text) {
        onUpdate(result.text);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al revisar la ortografía.");
    } finally {
      setCheckingGrammarId(null);
    }
  };

  const handleCheckGrammarObj = async (id: string, payload: any, onUpdate: (corrected: any) => void) => {
    setCheckingGrammarId(id);
    try {
      const response = await fetch('/api/check-grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isObject: true, data: payload })
      });
      const result = await response.json();
      if (result.data) {
        onUpdate(result.data);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al revisar la ortografía.");
    } finally {
      setCheckingGrammarId(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!data.personalInfo.jobTitle && data.experience.length === 0) {
      alert("Por favor, ingresa tu experiencia laboral o un Título Profesional para generar el perfil.");
      return;
    }
    
    setIsGeneratingSummary(true);
    const experiences = data.experience.map(e => {
      const start = e.startDate || 'Desconocido';
      const end = e.endDate || 'Actualidad';
      return `${e.position} en ${e.company} (${start} - ${end})`;
    }).join(', ');
    
    try {
      const response = await fetch('/api/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          position: data.personalInfo.jobTitle || 'Profesional',
          experiences: experiences || undefined
        })
      });
      const result = await response.json();
      if (result.text) {
        updatePersonalInfo('summary', result.text);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al generar la descripción.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateExperience = async (id: string, position: string, company: string) => {
    if (!position) {
      alert("Por favor, ingresa al menos un Cargo/Posición para generar la descripción.");
      return;
    }

    setGeneratingExpId(id);
    try {
      const response = await fetch('/api/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'experience',
          position,
          company
        })
      });
      const result = await response.json();
      if (result.text) {
        updateExperience(id, 'description', result.text);
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al generar la descripción.");
    } finally {
      setGeneratingExpId(null);
    }
  };

  const updatePersonalInfo = (field: keyof CVData['personalInfo'], value: string) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const addExperience = () => {
    onChange({
      ...data,
      experience: [
        ...data.experience,
        { id: crypto.randomUUID(), company: '', position: '', startDate: '', endDate: '', description: '' }
      ]
    });
  };

  const updateExperience = (id: string, field: keyof CVData['experience'][0], value: string) => {
    onChange({
      ...data,
      experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id)
    });
  };

  const moveExperience = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.experience.length - 1)
    ) return;
    
    const newExperience = [...data.experience];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newExperience[index], newExperience[swapIndex]] = [newExperience[swapIndex], newExperience[index]];
    
    onChange({ ...data, experience: newExperience });
  };

  const addEducation = () => {
    onChange({
      ...data,
      education: [
        ...data.education,
        { id: crypto.randomUUID(), institution: '', degree: '', startDate: '', endDate: '', description: '' }
      ]
    });
  };

  const updateEducation = (id: string, field: keyof CVData['education'][0], value: string) => {
    onChange({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  const moveEducation = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === data.education.length - 1)
    ) return;
    
    const newEducation = [...data.education];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newEducation[index], newEducation[swapIndex]] = [newEducation[swapIndex], newEducation[index]];
    
    onChange({ ...data, education: newEducation });
  };

  const addProject = () => {
    onChange({
      ...data,
      projects: [
        ...(data.projects || []),
        { id: crypto.randomUUID(), title: '', link: '', description: '', technologies: '' }
      ]
    });
  };

  const updateProject = (id: string, field: keyof CVData['projects'][0], value: string) => {
    onChange({
      ...data,
      projects: (data.projects || []).map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    });
  };

  const removeProject = (id: string) => {
    onChange({
      ...data,
      projects: (data.projects || []).filter(proj => proj.id !== id)
    });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const projs = data.projects || [];
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === projs.length - 1)
    ) return;
    
    const newProjects = [...projs];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newProjects[index], newProjects[swapIndex]] = [newProjects[swapIndex], newProjects[index]];
    
    onChange({ ...data, projects: newProjects });
  };

  const addSkill = () => {
    onChange({
      ...data,
      skills: [...data.skills, { id: crypto.randomUUID(), name: '' }]
    });
  };

  const updateSkill = (id: string, value: string) => {
    onChange({
      ...data,
      skills: data.skills.map(skill => skill.id === id ? { ...skill, name: value } : skill)
    });
  };

  const removeSkill = (id: string) => {
    onChange({
      ...data,
      skills: data.skills.filter(skill => skill.id !== id)
    });
  };

  const addLanguage = () => {
    onChange({
      ...data,
      languages: [...(data.languages || []), { id: crypto.randomUUID(), name: '', level: 'Básico' }]
    });
  };

  const updateLanguage = (id: string, field: keyof CVData['languages'][0], value: string) => {
    onChange({
      ...data,
      languages: data.languages.map(lang => lang.id === id ? { ...lang, [field]: value } : lang)
    });
  };

  const removeLanguage = (id: string) => {
    onChange({
      ...data,
      languages: data.languages.filter(lang => lang.id !== id)
    });
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">{title}</h2>
  );

  const isNameValid = !data.personalInfo.fullName || data.personalInfo.fullName.trim().length >= 2;
  const isEmailValid = !data.personalInfo.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personalInfo.email);
  const isPhoneValid = !data.personalInfo.phone || /^[\d\s\+\-\(\)]{7,20}$/.test(data.personalInfo.phone);

  return (
    <div className="space-y-8 p-6">
      {/* Theme Selector */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <SectionTitle title="Diseño del Currículum" />
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Estilo Visual</label>
            <div className="flex flex-wrap gap-3">
              {(['modern', 'minimalist', 'executive'] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateTheme(theme)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border capitalize ${
                    data.theme === theme 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {theme === 'modern' ? 'Moderno' : theme === 'minimalist' ? 'Minimalista' : 'Ejecutivo'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Color de Acento</label>
            <div className="flex flex-wrap gap-3">
              {(['slate', 'blue', 'emerald', 'rose', 'amber'] as const).map((color) => {
                const colorMap: Record<string, string> = {
                  slate: 'bg-slate-800',
                  blue: 'bg-blue-600',
                  emerald: 'bg-emerald-600',
                  rose: 'bg-rose-600',
                  amber: 'bg-amber-600',
                };
                
                return (
                  <button
                    key={color}
                    onClick={() => onChange({ ...data, colorTheme: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      (data.colorTheme || 'slate') === color 
                        ? 'border-slate-900 scale-110 shadow-sm' 
                        : 'border-transparent hover:scale-105'
                    } ${colorMap[color]}`}
                    title={`Color ${color}`}
                  />
                )
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Márgenes del Documento</label>
            <div className="flex flex-wrap gap-3">
              {(['narrow', 'normal', 'wide'] as const).map((margin) => (
                <button
                  key={margin}
                  onClick={() => onChange({ ...data, margins: margin })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border capitalize ${
                    (data.margins || 'normal') === margin 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {margin === 'narrow' ? 'Estrecho' : margin === 'wide' ? 'Ancho' : 'Normal'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-5">
          <input 
            type="checkbox" 
            id="showIcons" 
            checked={data.showContactIcons !== false} 
            onChange={e => onChange({ ...data, showContactIcons: e.target.checked })}
            className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer" 
          />
          <label htmlFor="showIcons" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
            Mostrar iconos junto a los datos de contacto
          </label>
        </div>
      </section>

      {/* Personal Info */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <SectionTitle title="Datos Personales" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex items-center gap-4 mb-2">
            <div className="relative w-20 h-20 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              {data.personalInfo.photo ? (
                <>
                  <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
                  <button onClick={removePhoto} className="absolute inset-0 bg-black/50 text-white opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                    <X className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <ImageIcon className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" id="photo-upload" />
              <label htmlFor="photo-upload" className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-50 cursor-pointer inline-block">
                Subir Foto
              </label>
              <p className="text-xs text-slate-500 mt-1">Formatos recomendados: JPG, PNG. (Opcional)</p>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Nombre Completo</label>
            <input 
              type="text" 
              value={data.personalInfo.fullName} 
              onChange={e => updatePersonalInfo('fullName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                isNameValid ? 'border-slate-300 focus:ring-slate-900' : 'border-red-500 focus:ring-red-500 bg-red-50'
              }`}
              placeholder="Ej. Juan Pérez"
            />
            {!isNameValid && <p className="text-red-500 text-xs mt-1">El nombre es demasiado corto.</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Título Profesional</label>
            <input 
              type="text" 
              value={data.personalInfo.jobTitle} 
              onChange={e => updatePersonalInfo('jobTitle', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Ej. Ingeniero de Software"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              value={data.personalInfo.email} 
              onChange={e => updatePersonalInfo('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                isEmailValid ? 'border-slate-300 focus:ring-slate-900' : 'border-red-500 focus:ring-red-500 bg-red-50'
              }`}
            />
            {!isEmailValid && <p className="text-red-500 text-xs mt-1">Formato de correo inválido.</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Teléfono</label>
            <input 
              type="tel" 
              value={data.personalInfo.phone} 
              onChange={e => updatePersonalInfo('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                isPhoneValid ? 'border-slate-300 focus:ring-slate-900' : 'border-red-500 focus:ring-red-500 bg-red-50'
              }`}
            />
            {!isPhoneValid && <p className="text-red-500 text-xs mt-1">Formato de teléfono inválido.</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Ubicación</label>
            <input 
              type="text" 
              value={data.personalInfo.location} 
              onChange={e => updatePersonalInfo('location', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Ej. Madrid, España"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Sitio Web / LinkedIn</label>
            <input 
              type="text" 
              value={data.personalInfo.website} 
              onChange={e => updatePersonalInfo('website', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="md:col-span-2 space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">Perfil / Resumen Profesional</label>
              <div className="flex gap-4 items-center">
                <button 
                  onClick={() => handleCheckGrammar('summary', data.personalInfo.summary, (val) => updatePersonalInfo('summary', val))}
                  disabled={checkingGrammarId === 'summary' || !data.personalInfo.summary}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                  title="Revisar ortografía y gramática"
                >
                  {checkingGrammarId === 'summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <SpellCheck className="w-3 h-3" />}
                  Corregir
                </button>
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
                >
                  {isGeneratingSummary ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  Generar con IA
                </button>
              </div>
            </div>
            <textarea 
              value={data.personalInfo.summary} 
              onChange={e => updatePersonalInfo('summary', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
              placeholder="Un breve resumen de tu trayectoria y objetivos profesionales..."
            />
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Experiencia Laboral</h2>
          <button onClick={addExperience} className="text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        <div className="space-y-6">
          {data.experience.map((exp, index) => (
            <div key={exp.id} className="p-4 border border-slate-200 rounded-lg relative bg-slate-50/50">
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button 
                  onClick={() => moveExperience(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover arriba"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => moveExperience(index, 'down')}
                  disabled={index === data.experience.length - 1}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover abajo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors ml-2 cursor-pointer"
                  title="Eliminar experiencia"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-32">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Cargo / Posición</label>
                  <input type="text" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Empresa</label>
                  <input type="text" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Fecha de Inicio</label>
                  <input type="text" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Ej. Ene 2020" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Fecha de Fin</label>
                  <input type="text" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Ej. Presente" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-slate-700">Descripción (Logros y responsabilidades)</label>
                    <div className="flex gap-4 items-center">
                      <button 
                        onClick={() => handleCheckGrammarObj(`exp-${exp.id}`, { position: exp.position, company: exp.company, description: exp.description }, (val) => {
                          const newData = { ...data };
                          const index = newData.experience.findIndex(e => e.id === exp.id);
                          if (index > -1) {
                            newData.experience[index] = { ...newData.experience[index], ...val };
                            onChange(newData);
                          }
                        })}
                        disabled={checkingGrammarId === `exp-${exp.id}`}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                        title="Revisar ortografía y gramática de este bloque"
                      >
                        {checkingGrammarId === `exp-${exp.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <SpellCheck className="w-3 h-3" />}
                        Corregir
                      </button>
                      <button 
                        onClick={() => handleGenerateExperience(exp.id, exp.position, exp.company)}
                        disabled={generatingExpId === exp.id}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50"
                      >
                        {generatingExpId === exp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        Sugerir viñetas
                      </button>
                    </div>
                  </div>
                  <textarea rows={3} value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
                </div>
              </div>
            </div>
          ))}
          {data.experience.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No has añadido ninguna experiencia todavía.</p>}
        </div>
      </section>

      {/* Education */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Educación</h2>
          <button onClick={addEducation} className="text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        <div className="space-y-6">
          {data.education.map((edu, index) => (
            <div key={edu.id} className="p-4 border border-slate-200 rounded-lg relative bg-slate-50/50">
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button 
                  onClick={() => moveEducation(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover arriba"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => moveEducation(index, 'down')}
                  disabled={index === data.education.length - 1}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover abajo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors ml-2 cursor-pointer"
                  title="Eliminar educación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-32">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Título / Carrera</label>
                  <input type="text" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Institución</label>
                  <input type="text" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Fecha de Inicio</label>
                  <input type="text" value={edu.startDate} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} placeholder="Ej. 2015" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Fecha de Fin</label>
                  <input type="text" value={edu.endDate} onChange={e => updateEducation(edu.id, 'endDate', e.target.value)} placeholder="Ej. 2019" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-slate-700">Descripción Adicional (Opcional)</label>
                    <button 
                      onClick={() => handleCheckGrammarObj(`edu-${edu.id}`, { degree: edu.degree, institution: edu.institution, description: edu.description }, (val) => {
                        const newData = { ...data };
                        const index = newData.education.findIndex(e => e.id === edu.id);
                        if (index > -1) {
                          newData.education[index] = { ...newData.education[index], ...val };
                          onChange(newData);
                        }
                      })}
                      disabled={checkingGrammarId === `edu-${edu.id}`}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                      title="Revisar ortografía y gramática de este bloque"
                    >
                      {checkingGrammarId === `edu-${edu.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <SpellCheck className="w-3 h-3" />}
                      Corregir
                    </button>
                  </div>
                  <textarea rows={2} value={edu.description} onChange={e => updateEducation(edu.id, 'description', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" />
                </div>
              </div>
            </div>
          ))}
          {data.education.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No has añadido ninguna educación todavía.</p>}
        </div>
      </section>

      {/* Projects */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Proyectos</h2>
          <button onClick={addProject} className="text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        <div className="space-y-4">
          {(data.projects || []).map((proj, index) => (
            <div key={proj.id} className="p-4 border border-slate-200 rounded-lg relative bg-slate-50 group hover:bg-white transition-colors">
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button 
                  onClick={() => moveProject(index, 'up')}
                  disabled={index === 0}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover arriba"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => moveProject(index, 'down')}
                  disabled={index === (data.projects || []).length - 1}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Mover abajo"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => removeProject(proj.id)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors ml-2 cursor-pointer"
                  title="Eliminar proyecto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-32">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Título del Proyecto</label>
                  <input type="text" value={proj.title} onChange={e => updateProject(proj.id, 'title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ej. E-commerce Platform" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">Enlace (Opcional)</label>
                  <input type="text" value={proj.link} onChange={e => updateProject(proj.id, 'link', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ej. github.com/..." />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-sm font-medium text-slate-700">Tecnologías (separadas por comas)</label>
                  <input type="text" value={proj.technologies} onChange={e => updateProject(proj.id, 'technologies', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" placeholder="Ej. React, Node.js, MongoDB" />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-slate-700">Descripción del Proyecto</label>
                    <button 
                      onClick={() => handleCheckGrammarObj(`proj-${proj.id}`, { title: proj.title, description: proj.description }, (val) => {
                        const newData = { ...data };
                        const index = (newData.projects || []).findIndex(e => e.id === proj.id);
                        if (index > -1) {
                          newData.projects[index] = { ...newData.projects[index], ...val };
                          onChange(newData);
                        }
                      })}
                      disabled={checkingGrammarId === `proj-${proj.id}`}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50"
                      title="Revisar ortografía y gramática"
                    >
                      {checkingGrammarId === `proj-${proj.id}` ? <Loader2 className="w-3 h-3 animate-spin" /> : <SpellCheck className="w-3 h-3" />}
                      Corregir
                    </button>
                  </div>
                  <textarea rows={3} value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none" placeholder="Describe brevemente el propósito y tus contribuciones..." />
                </div>
              </div>
            </div>
          ))}
          {(data.projects || []).length === 0 && <p className="text-slate-500 text-sm text-center py-4">No has añadido ningún proyecto todavía.</p>}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Habilidades</h2>
          <button onClick={addSkill} className="text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        
        <div className="mb-6 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Sugerencias de IA
            </label>
            <span className="text-xs text-slate-500">
              Sector: {data.personalInfo.jobTitle || 'General'}
            </span>
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Ej. Diseño, Backend, Finanzas..."
              value={skillKeyword}
              onChange={(e) => setSkillKeyword(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              onClick={() => fetchSuggestedSkills(skillKeyword)}
              disabled={isSuggestingSkills}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSuggestingSkills ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sugerir'}
            </button>
          </div>
          {suggestedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => {
                    if (!data.skills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
                      onChange({ ...data, skills: [...data.skills, { id: crypto.randomUUID(), name: skill }] });
                    }
                  }}
                  className="text-xs bg-white text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-full hover:bg-indigo-50 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Añadir habilidad"
                >
                  <Plus className="w-3 h-3" /> {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {data.skills.map((skill) => (
            <div key={skill.id} className="flex items-center gap-2">
              <input 
                type="text" 
                value={skill.name} 
                onChange={e => updateSkill(skill.id, e.target.value)} 
                placeholder="Ej. React, Liderazgo..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" 
              />
              <button 
                onClick={() => removeSkill(skill.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {data.skills.length === 0 && <p className="text-slate-500 text-sm col-span-full py-2">Añade algunas habilidades clave.</p>}
        </div>
      </section>

      {/* Languages */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
          <h2 className="text-xl font-semibold text-slate-800">Idiomas</h2>
          <button onClick={addLanguage} className="text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
        <div className="space-y-4">
          {(data.languages || []).map((lang) => (
            <div key={lang.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input 
                type="text" 
                value={lang.name} 
                onChange={e => updateLanguage(lang.id, 'name', e.target.value)} 
                placeholder="Ej. Inglés, Francés..."
                className="w-full sm:flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900" 
              />
              <select
                value={lang.level}
                onChange={e => updateLanguage(lang.id, 'level', e.target.value)}
                className="w-full sm:w-48 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
              >
                <option value="Básico">Básico</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
                <option value="Bilingüe">Bilingüe</option>
                <option value="Nativo">Nativo</option>
              </select>
              <button 
                onClick={() => removeLanguage(lang.id)}
                className="text-slate-400 hover:text-red-500 p-2 rounded-md transition-colors cursor-pointer hidden sm:block"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => removeLanguage(lang.id)}
                className="text-red-500 text-sm font-medium sm:hidden mt-1"
              >
                Eliminar idioma
              </button>
            </div>
          ))}
          {(!data.languages || data.languages.length === 0) && <p className="text-slate-500 text-sm py-2">Añade los idiomas que dominas.</p>}
        </div>
      </section>
    </div>
  );
}
