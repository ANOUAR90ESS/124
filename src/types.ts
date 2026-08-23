export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  website: string;
  photo?: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Project {
  id: string;
  title: string;
  link?: string;
  description: string;
  technologies: string;
}

export type Theme = 'modern' | 'minimalist' | 'executive';
export type ColorTheme = 'slate' | 'blue' | 'emerald' | 'rose' | 'amber';
export type Margins = 'narrow' | 'normal' | 'wide';

export interface CVData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  theme: Theme;
  colorTheme?: ColorTheme;
  showContactIcons?: boolean;
  margins?: Margins;
}

export const initialCVData: CVData = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    website: '',
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  languages: [],
  theme: 'modern',
  colorTheme: 'slate',
  showContactIcons: true,
  margins: 'normal',
};
