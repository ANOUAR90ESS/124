import { CVData } from '../types';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { formatDate } from '../utils';

interface PreviewProps {
  data: CVData;
}

export default function Preview({ data }: PreviewProps) {
  const { personalInfo, experience, education, projects = [], skills, languages = [], theme, showContactIcons = true, colorTheme = 'slate', margins = 'normal' } = data;

  const colorMap: Record<string, any> = {
    slate: {
      bg: 'bg-slate-900',
      text: 'text-slate-900',
      border: 'border-slate-900',
      textLight: 'text-slate-300',
      company: 'text-slate-800',
      date: 'text-slate-600',
    },
    blue: {
      bg: 'bg-blue-800',
      text: 'text-blue-800',
      border: 'border-blue-800',
      textLight: 'text-blue-200',
      company: 'text-blue-800',
      date: 'text-slate-600',
    },
    emerald: {
      bg: 'bg-emerald-800',
      text: 'text-emerald-800',
      border: 'border-emerald-800',
      textLight: 'text-emerald-200',
      company: 'text-emerald-800',
      date: 'text-slate-600',
    },
    rose: {
      bg: 'bg-rose-800',
      text: 'text-rose-800',
      border: 'border-rose-800',
      textLight: 'text-rose-200',
      company: 'text-rose-800',
      date: 'text-slate-600',
    },
    amber: {
      bg: 'bg-amber-700',
      text: 'text-amber-700',
      border: 'border-amber-700',
      textLight: 'text-amber-100',
      company: 'text-amber-700',
      date: 'text-slate-600',
    },
  };

  const marginConfig: Record<string, any> = {
    narrow: {
      minimalist: 'p-8',
      executiveHeader: 'px-8 py-6',
      executiveBody: 'p-8',
      modernHeader: 'py-6 px-8',
      modernMain: 'p-8',
      modernSide: 'bg-slate-50 p-6',
    },
    normal: {
      minimalist: 'p-16',
      executiveHeader: 'px-12 py-10',
      executiveBody: 'p-12',
      modernHeader: 'py-10 px-12',
      modernMain: 'p-12',
      modernSide: 'bg-slate-50 p-10',
    },
    wide: {
      minimalist: 'p-24',
      executiveHeader: 'px-16 py-12',
      executiveBody: 'p-16',
      modernHeader: 'py-12 px-16',
      modernMain: 'p-16',
      modernSide: 'bg-slate-50 p-12',
    }
  };

  const c = colorMap[colorTheme];
  const m = marginConfig[margins || 'normal'];

  const renderContactInfo = (colorClass: string = "text-slate-500", iconColorClass: string = "text-slate-400") => (
    <div className={`flex flex-wrap gap-4 text-sm ${colorClass}`}>
      {personalInfo.email && (
        <div className="flex items-center gap-1.5">
          {showContactIcons && <Mail className={`w-4 h-4 ${iconColorClass}`} />}
          <span>{personalInfo.email}</span>
        </div>
      )}
      {personalInfo.phone && (
        <div className="flex items-center gap-1.5">
          {showContactIcons && <Phone className={`w-4 h-4 ${iconColorClass}`} />}
          <span>{personalInfo.phone}</span>
        </div>
      )}
      {personalInfo.location && (
        <div className="flex items-center gap-1.5">
          {showContactIcons && <MapPin className={`w-4 h-4 ${iconColorClass}`} />}
          <span>{personalInfo.location}</span>
        </div>
      )}
      {personalInfo.website && (
        <div className="flex items-center gap-1.5">
          {showContactIcons && <Globe className={`w-4 h-4 ${iconColorClass}`} />}
          <span>{personalInfo.website}</span>
        </div>
      )}
    </div>
  );

  if (theme === 'minimalist') {
    return (
      <div className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] mx-auto print-exact overflow-hidden p-16 font-sans">
        <header className="mb-10 text-center">
          {personalInfo.photo && (
            <img src={personalInfo.photo} alt="Profile" className={`w-32 h-32 rounded-full object-cover mx-auto mb-6 border-2 ${c.border}`} />
          )}
          <h1 className="text-4xl font-light text-slate-800 mb-2 tracking-tight">
            {personalInfo.fullName || 'Nombre Apellido'}
          </h1>
          <h2 className={`text-xl ${c.text} font-medium tracking-wide mb-6`}>
            {personalInfo.jobTitle || 'Título Profesional'}
          </h2>
          <div className="flex justify-center">
            {renderContactInfo('text-slate-600', 'text-slate-400')}
          </div>
        </header>

        {personalInfo.summary && (
          <section className="mb-10">
            <h3 className={`text-sm font-bold ${c.text} uppercase tracking-widest mb-4`}>Perfil</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {personalInfo.summary}
            </p>
          </section>
        )}

        {experience.length > 0 && (
          <section className="mb-10">
            <h3 className={`text-sm font-bold ${c.text} uppercase tracking-widest mb-6`}>Experiencia</h3>
            <div className="space-y-8">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-base font-semibold text-slate-800">{exp.position}</h4>
                    <span className={`text-xs font-semibold ${c.date}`}>{formatDate(exp.startDate)} {exp.endDate ? `- ${formatDate(exp.endDate)}` : ''}</span>
                  </div>
                  <div className={`text-sm font-bold ${c.company} mb-3`}>{exp.company}</div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-10">
            <h3 className={`text-sm font-bold ${c.text} uppercase tracking-widest mb-6`}>Educación</h3>
            <div className="space-y-6">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-base font-semibold text-slate-800">{edu.degree}</h4>
                    <span className={`text-xs font-semibold ${c.date}`}>{formatDate(edu.startDate)} {edu.endDate ? `- ${formatDate(edu.endDate)}` : ''}</span>
                  </div>
                  <div className={`text-sm font-bold ${c.company} mb-2`}>{edu.institution}</div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {edu.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <h3 className={`text-sm font-bold ${c.text} uppercase tracking-widest mb-4`}>Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill.id} className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="mt-10">
            <h3 className={`text-sm font-bold ${c.text} uppercase tracking-widest mb-4`}>Idiomas</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span key={lang.id} className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                  <span className="font-semibold">{lang.name}</span> <span className="text-slate-400 text-xs ml-1">{lang.level}</span>
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  if (theme === 'executive') {
    return (
      <div className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] mx-auto print-exact overflow-hidden flex flex-col font-sans">
        <header className={`px-12 py-10 border-b-4 ${c.border}`}>
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-6">
              {personalInfo.photo && (
                <img src={personalInfo.photo} alt="Profile" className="w-24 h-24 rounded-lg object-cover shrink-0 border border-slate-200" />
              )}
              <div>
                <h1 className={`text-4xl font-extrabold ${c.text} mb-1 tracking-tight`}>
                  {personalInfo.fullName || 'Nombre Apellido'}
                </h1>
                <h2 className="text-xl text-slate-600 font-medium">
                  {personalInfo.jobTitle || 'Título Profesional'}
                </h2>
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5 text-sm text-slate-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.location && <span>{personalInfo.location}</span>}
              {personalInfo.website && <span>{personalInfo.website}</span>}
            </div>
          </div>
        </header>

        <div className="p-12">
          {personalInfo.summary && (
            <section className="mb-10">
              <h3 className={`text-lg font-bold ${c.text} border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider`}>Perfil Profesional</h3>
              <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-10">
              <h3 className={`text-lg font-bold ${c.text} border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider`}>Experiencia Profesional</h3>
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h4 className="text-base font-bold text-slate-900">{exp.position}</h4>
                      <span className={`text-sm font-semibold ${c.date}`}>{formatDate(exp.startDate)} {exp.endDate ? `- ${formatDate(exp.endDate)}` : ''}</span>
                    </div>
                    <div className={`text-sm font-bold ${c.company} mb-2`}>{exp.company}</div>
                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-wrap ml-4 border-l-2 border-slate-200 pl-4">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-8">
            {education.length > 0 && (
              <section>
                <h3 className={`text-lg font-bold ${c.text} border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider`}>Educación</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <h4 className="text-base font-bold text-slate-900">{edu.degree}</h4>
                      <div className={`text-sm font-bold ${c.company}`}>{edu.institution}</div>
                      <div className={`text-sm ${c.date} mb-1`}>{formatDate(edu.startDate)} {edu.endDate ? `- ${formatDate(edu.endDate)}` : ''}</div>
                      <p className="text-slate-700 text-sm">
                        {edu.description}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section>
                <h3 className={`text-lg font-bold ${c.text} border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider`}>Competencias</h3>
                <ul className="list-disc list-inside text-sm text-slate-800 space-y-1">
                  {skills.map((skill) => (
                    <li key={skill.id}>{skill.name}</li>
                  ))}
                </ul>
              </section>
            )}

            {languages.length > 0 && (
              <section className="mt-8">
                <h3 className={`text-lg font-bold ${c.text} border-b border-slate-300 pb-1 mb-4 uppercase tracking-wider`}>Idiomas</h3>
                <ul className="space-y-2">
                  {languages.map((lang) => (
                    <li key={lang.id} className="flex justify-between items-center text-sm text-slate-800">
                      <span className="font-semibold">{lang.name}</span>
                      <span className="text-slate-600 italic">{lang.level}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default: modern theme
  return (
    <div className="bg-white shadow-lg w-full max-w-[210mm] min-h-[297mm] mx-auto print-exact overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <header className={`${c.bg} text-white py-10 px-12 flex justify-between items-center`}>
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">
            {personalInfo.fullName || 'Nombre Apellido'}
          </h1>
          <h2 className={`text-xl ${c.textLight} font-medium tracking-wider uppercase mb-6`}>
            {personalInfo.jobTitle || 'Título Profesional'}
          </h2>
          <div className={`flex flex-wrap gap-4 text-sm ${c.textLight}`}>
            {renderContactInfo(c.textLight, 'opacity-70')}
          </div>
        </div>
        {personalInfo.photo && (
          <img src={personalInfo.photo} alt="Profile" className={`w-32 h-32 rounded-full border-4 ${c.border} object-cover shrink-0 ml-6`} />
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Column */}
        <div className="w-full md:w-2/3 p-12">
          {personalInfo.summary && (
            <section className="mb-10">
              <h3 className={`text-lg font-bold ${c.text} uppercase tracking-wider border-b-2 ${c.border} pb-2 mb-4`}>
                Perfil Profesional
              </h3>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {experience.length > 0 && (
            <section className="mb-10">
              <h3 className={`text-lg font-bold ${c.text} uppercase tracking-wider border-b-2 ${c.border} pb-2 mb-6`}>
                Experiencia
              </h3>
              <div className="space-y-6">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <h4 className="text-base font-bold text-slate-900">{exp.position}</h4>
                    <div className="flex justify-between items-baseline mb-2 mt-1">
                      <span className={`text-sm font-bold ${c.company}`}>{exp.company}</span>
                      <span className={`text-sm font-semibold ${c.date}`}>{formatDate(exp.startDate)} {exp.endDate ? `- ${formatDate(exp.endDate)}` : ''}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h3 className={`text-lg font-bold ${c.text} uppercase tracking-wider border-b-2 ${c.border} pb-2 mb-6`}>
                Educación
              </h3>
              <div className="space-y-6">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <h4 className="text-base font-bold text-slate-900">{edu.degree}</h4>
                    <div className="flex justify-between items-baseline mb-2 mt-1">
                      <span className={`text-sm font-bold ${c.company}`}>{edu.institution}</span>
                      <span className={`text-sm font-semibold ${c.date}`}>{formatDate(edu.startDate)} {edu.endDate ? `- ${formatDate(edu.endDate)}` : ''}</span>
                    </div>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {edu.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="w-full md:w-1/3 bg-slate-50 p-12 md:pl-8 border-l border-slate-100">
          {skills.length > 0 && (
            <section>
              <h3 className={`text-lg font-bold ${c.text} uppercase tracking-wider border-b-2 border-slate-200 pb-2 mb-6`}>
                Habilidades
              </h3>
              <div className="flex flex-col gap-3">
                {skills.map((skill) => (
                  <div key={skill.id} className="text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded">
                    {skill.name}
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section className="mt-10">
              <h3 className={`text-lg font-bold ${c.text} uppercase tracking-wider border-b-2 border-slate-200 pb-2 mb-6`}>
                Idiomas
              </h3>
              <div className="flex flex-col gap-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="text-sm bg-white border border-slate-200 px-3 py-2 rounded flex justify-between items-center">
                    <span className="font-medium text-slate-700">{lang.name}</span>
                    <span className="text-slate-500 text-xs">{lang.level}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
