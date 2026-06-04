import { create } from "zustand";

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  year: string;
  gpa?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

export interface Project {
  id: string;
  name: string;
  tech: string;
  description: string;
  link?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: Project[];
  experience: Experience[];
  certifications: string[];
  achievements: string[];
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
}

export type UserType = "student" | "fresher" | "experienced" | "switcher" | null;

export interface ResumeAnalysis {
  missingSkills: string[];
  weakSections: string[];
  keywordOptimization: string[];
  suggestions: string[];
  improvementTips: string[];
}

export interface ResumeDNA {
  leadership: number;
  technicalDepth: number;
  collaboration: number;
}

export interface SkillGap {
  identifiedGaps: string[];
  actionableFeedback: string;
}

export interface ResumeState {
  resumeId: string | null;
  resumeTitle: string;
  resumeData: ResumeData;
  templateId: string;
  templateType: string;
  themeConfig: ThemeConfig;
  userType: UserType;
  resumeScore: number | null;
  analysis: ResumeAnalysis | null;
  resumeDNA: ResumeDNA | null;
  skillGap: SkillGap | null;
  step: number;
  autosaveStatus: "idle" | "saving" | "saved" | "error";
  history: ResumeData[];
  historyIndex: number;
  
  // Actions
  initResume: (id: string | null, title: string, data?: Partial<ResumeData>, template?: string, theme?: Partial<ThemeConfig>, extraProps?: any) => void;
  setStep: (step: number) => void;
  setTemplate: (templateId: string, templateType?: string) => void;
  setUserType: (type: UserType) => void;
  setAnalysisData: (score: number, analysis: ResumeAnalysis, dna: ResumeDNA, gap: SkillGap) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
  setResumeTitle: (title: string) => void;
  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  
  // Education Actions
  addEducation: (edu?: Partial<Education>) => void;
  updateEducation: (id: string, edu: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  // Experience Actions
  addExperience: (exp?: Partial<Experience>) => void;
  updateExperience: (id: string, exp: Partial<Experience>) => void;
  addExperienceBullet: (expId: string) => void;
  updateExperienceBullet: (expId: string, index: number, text: string) => void;
  removeExperience: (id: string) => void;
  
  // Project Actions
  addProject: (proj?: Partial<Project>) => void;
  updateProject: (id: string, proj: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // Skills Actions
  addSkill: (category: "technical" | "soft" | "languages", skill: string) => void;
  removeSkill: (category: "technical" | "soft" | "languages", index: number) => void;
  
  // Certifications & Achievements Actions
  addCertification: (cert: string) => void;
  removeCertification: (index: number) => void;
  addAchievement: (ach: string) => void;
  removeAchievement: (index: number) => void;
  
  // History Undo / Redo
  undo: () => void;
  redo: () => void;
  setAutosaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
}

const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  education: [],
  skills: {
    technical: [],
    soft: [],
    languages: [],
  },
  projects: [],
  experience: [],
  certifications: [],
  achievements: [],
};

const DEFAULT_THEME_CONFIG: ThemeConfig = {
  primaryColor: "#0f172a",
  accentColor: "#6366f1",
  fontFamily: "Inter",
  fontSize: "12px",
  lineHeight: "1.4",
};

export const useResumeStore = create<ResumeState>((set, get) => {
  // Push state to history stack
  const pushToHistory = (newData: ResumeData) => {
    const { history, historyIndex } = get();
    const cleanHistory = history.slice(0, historyIndex + 1);
    
    // Cap history size at 20 edits to avoid memory issues
    if (cleanHistory.length >= 20) {
      cleanHistory.shift();
    }
    
    set({
      history: [...cleanHistory, JSON.parse(JSON.stringify(newData))],
      historyIndex: cleanHistory.length,
    });
  };

  return {
    resumeId: null,
    resumeTitle: "Untitled Resume",
    resumeData: JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)),
    templateId: "nova",
    templateType: "modern",
    themeConfig: { ...DEFAULT_THEME_CONFIG },
    userType: null,
    resumeScore: null,
    analysis: null,
    resumeDNA: null,
    skillGap: null,
    step: 0,
    autosaveStatus: "idle",
    history: [JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA))],
    historyIndex: 0,

    initResume: (id, title, data, template, theme, extraProps) => {
      const mergedData = {
        ...JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)),
        ...data,
        personalInfo: {
          ...DEFAULT_RESUME_DATA.personalInfo,
          ...data?.personalInfo,
        },
        skills: {
          ...DEFAULT_RESUME_DATA.skills,
          ...data?.skills,
        },
      };

      set({
        resumeId: id,
        resumeTitle: title || "Untitled Resume",
        resumeData: mergedData,
        templateId: template || "nova",
        templateType: extraProps?.templateType || "modern",
        themeConfig: { ...DEFAULT_THEME_CONFIG, ...theme },
        userType: extraProps?.userType || null,
        resumeScore: extraProps?.resumeScore || null,
        analysis: extraProps?.analysis || null,
        resumeDNA: extraProps?.resumeDNA || null,
        skillGap: extraProps?.skillGap || null,
        step: 0,
        autosaveStatus: "idle",
        history: [JSON.parse(JSON.stringify(mergedData))],
        historyIndex: 0,
      });
    },

    setStep: (step) => set({ step }),
    setTemplate: (templateId, templateType) => set((state) => ({ templateId, templateType: templateType || state.templateType })),
    setUserType: (userType) => set({ userType }),
    setAnalysisData: (resumeScore, analysis, resumeDNA, skillGap) => set({ resumeScore, analysis, resumeDNA, skillGap }),
    updateTheme: (theme) => set((state) => ({ themeConfig: { ...state.themeConfig, ...theme } })),
    setResumeTitle: (resumeTitle) => set({ resumeTitle }),

    updatePersonalInfo: (info) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        personalInfo: { ...resumeData.personalInfo, ...info },
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addEducation: (edu) => {
      const { resumeData } = get();
      const newEdu: Education = {
        id: Math.random().toString(36).slice(2, 9),
        school: "",
        degree: "",
        field: "",
        year: "",
        ...edu,
      };
      const updated = {
        ...resumeData,
        education: [...resumeData.education, newEdu],
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    updateEducation: (id, edu) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        education: resumeData.education.map((e) => (e.id === id ? { ...e, ...edu } : e)),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    removeEducation: (id) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        education: resumeData.education.filter((e) => e.id !== id),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addExperience: (exp) => {
      const { resumeData } = get();
      const newExp: Experience = {
        id: Math.random().toString(36).slice(2, 9),
        title: "",
        company: "",
        duration: "",
        bullets: [""],
        ...exp,
      };
      const updated = {
        ...resumeData,
        experience: [...resumeData.experience, newExp],
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    updateExperience: (id, exp) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        experience: resumeData.experience.map((e) => (e.id === id ? { ...e, ...exp } : e)),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addExperienceBullet: (expId) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        experience: resumeData.experience.map((e) =>
          e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e
        ),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    updateExperienceBullet: (expId, index, text) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        experience: resumeData.experience.map((e) => {
          if (e.id === expId) {
            const copy = [...e.bullets];
            copy[index] = text;
            return { ...e, bullets: copy };
          }
          return e;
        }),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    removeExperience: (id) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        experience: resumeData.experience.filter((e) => e.id !== id),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addProject: (proj) => {
      const { resumeData } = get();
      const newProj: Project = {
        id: Math.random().toString(36).slice(2, 9),
        name: "",
        tech: "",
        description: "",
        ...proj,
      };
      const updated = {
        ...resumeData,
        projects: [...resumeData.projects, newProj],
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    updateProject: (id, proj) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        projects: resumeData.projects.map((p) => (p.id === id ? { ...p, ...proj } : p)),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    removeProject: (id) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        projects: resumeData.projects.filter((p) => p.id !== id),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addSkill: (category, skill) => {
      const { resumeData } = get();
      if (!skill.trim() || resumeData.skills[category].includes(skill.trim())) return;
      const updated = {
        ...resumeData,
        skills: {
          ...resumeData.skills,
          [category]: [...resumeData.skills[category], skill.trim()],
        },
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    removeSkill: (category, index) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        skills: {
          ...resumeData.skills,
          [category]: resumeData.skills[category].filter((_, i) => i !== index),
        },
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addCertification: (cert) => {
      const { resumeData } = get();
      if (!cert.trim() || resumeData.certifications.includes(cert.trim())) return;
      const updated = {
        ...resumeData,
        certifications: [...resumeData.certifications, cert.trim()],
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    removeCertification: (index) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        certifications: resumeData.certifications.filter((_, i) => i !== index),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    addAchievement: (ach) => {
      const { resumeData } = get();
      if (!ach.trim() || resumeData.achievements.includes(ach.trim())) return;
      const updated = {
        ...resumeData,
        achievements: [...resumeData.achievements, ach.trim()],
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    removeAchievement: (index) => {
      const { resumeData } = get();
      const updated = {
        ...resumeData,
        achievements: resumeData.achievements.filter((_, i) => i !== index),
      };
      set({ resumeData: updated });
      pushToHistory(updated);
    },

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        set({
          resumeData: JSON.parse(JSON.stringify(history[prevIndex])),
          historyIndex: prevIndex,
        });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        set({
          resumeData: JSON.parse(JSON.stringify(history[nextIndex])),
          historyIndex: nextIndex,
        });
      }
    },

    setAutosaveStatus: (autosaveStatus) => set({ autosaveStatus }),
  };
});
