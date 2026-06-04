"use client";

import React, { useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { useResumeStore, ResumeData } from "@/lib/store";
import { ResumeTemplate } from "@/components/templates/ResumeTemplate";
import { 
  User, Briefcase, GraduationCap, Code, FileText, CheckCircle2, 
  Sparkles, RefreshCw, Download, FileCode, Check, AlertCircle, 
  HelpCircle, Star, Terminal, Zap, BookOpen, Send, Award, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  { id: 0, name: "User Type", icon: HelpCircle, desc: "Select career stage" },
  { id: 1, name: "Profile", icon: User, desc: "Personal & contact info" },
  { id: 2, name: "Education", icon: GraduationCap, desc: "Degrees & schools" },
  { id: 3, name: "Experience", icon: Briefcase, desc: "Work & roles" },
  { id: 4, name: "Projects", icon: FileCode, desc: "Technical builds" },
  { id: 5, name: "Skills", icon: Code, desc: "Tech & credentials" },
  { id: 6, name: "AI Analysis", icon: Sparkles, desc: "ATS score & DNA check" },
  { id: 7, name: "Finalize", icon: FileText, desc: "Template & exports" }
];

export function ResumeBuilder({ id }: { id?: string | null }) {
  const {
    resumeId, resumeTitle, resumeData, templateId, themeConfig, step,
    userType, setUserType, setAnalysisData,
    initResume, setStep, setTemplate, updateTheme, setResumeTitle,
    updatePersonalInfo, addEducation, updateEducation, removeEducation,
    addExperience, updateExperience, addExperienceBullet, updateExperienceBullet, removeExperience,
    addProject, updateProject, removeProject, addSkill, removeSkill,
    addCertification, removeCertification, addAchievement, removeAchievement,
    undo, redo, autosaveStatus, setAutosaveStatus
  } = useResumeStore();

  const [activePanel, setActivePanel] = useState<"preview" | "score" | "coach">("preview");

  // Print ref for PDF generation
  const printRef = React.useRef<HTMLDivElement>(null);
  const [skillInputs, setSkillInputs] = useState({ technical: "", soft: "", languages: "" });
  const [certInput, setCertInput] = useState("");
  const [achInput, setAchInput] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // AI loading and outputs
  const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
  const [enhancingTexts, setEnhancingTexts] = useState<Record<string, boolean>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);
  const [interviewQs, setInterviewQs] = useState<any[]>([]);
  const [coverLetter, setCoverLetter] = useState("");
  const [roastResult, setRoastResult] = useState<any>(null);

  // Fetch resume details from the database on ID change
  useEffect(() => {
    if (!id) return;
    
    const fetchResume = async () => {
      try {
        const res = await fetch(`/api/resumes/${id}`);
        const data = await res.json();
        if (data.resume) {
          initResume(
            data.resume.id,
            data.resume.title,
            data.resume.data,
            data.resume.templateId,
            data.resume.themeConfig,
            {
              templateType: data.resume.templateType,
              userType: data.resume.userType,
              resumeScore: data.resume.resumeScore,
              analysis: data.resume.analysis,
              resumeDNA: data.resume.resumeDNA,
              skillGap: data.resume.skillGap,
            }
          );
        }
      } catch (e) {
        console.error("Failed to load resume", e);
        triggerToast("Failed to load resume details", "error");
      }
    };
    
    fetchResume();
  }, [id]);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Helper to calculate ATS Score completeness
  const calculateCompleteness = (): number => {
    let score = 0;
    const p = resumeData.personalInfo;
    if (p.fullName) score += 10;
    if (p.email) score += 10;
    if (p.phone) score += 10;
    if (p.summary && p.summary.length > 50) score += 15;
    if (resumeData.experience.length > 0) score += 20;
    if (resumeData.education.length > 0) score += 15;
    if (resumeData.skills.technical.length >= 4) score += 10;
    if (resumeData.projects.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const atsScore = calculateCompleteness();

  // Autosave to database in real-time
  useEffect(() => {
    if (!resumeId || resumeId === "res_local_1") return;
    setAutosaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/resumes/${resumeId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: resumeTitle,
            templateId: templateId,
            templateType: useResumeStore.getState().templateType,
            userType: useResumeStore.getState().userType,
            resumeScore: useResumeStore.getState().resumeScore,
            analysis: useResumeStore.getState().analysis,
            resumeDNA: useResumeStore.getState().resumeDNA,
            skillGap: useResumeStore.getState().skillGap,
            themeConfig: themeConfig,
            data: resumeData
          })
        });
        if (res.ok) {
          setAutosaveStatus("saved");
        } else {
          setAutosaveStatus("error");
        }
      } catch (e) {
        console.error("Autosave failed", e);
        setAutosaveStatus("error");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    resumeData, templateId, themeConfig, resumeTitle, resumeId,
    useResumeStore.getState().userType,
    useResumeStore.getState().templateType,
    useResumeStore.getState().resumeScore
  ]);


  const handleEnhanceText = async (field: "summary" | string, currentValue: string, callback: (enhanced: string) => void) => {
    if (!currentValue.trim()) {
      triggerToast("Please enter some text to enhance first", "error");
      return;
    }
    setEnhancingTexts(prev => ({ ...prev, [field]: true }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "enhance_description",
          text: currentValue,
          userType: useResumeStore.getState().userType
        })
      });
      const data = await res.json();
      if (data.enhancedText) {
        callback(data.enhancedText);
        triggerToast("Text enhanced with action verbs!");
      } else {
        triggerToast("Failed to enhance text", "error");
      }
    } catch {
      triggerToast("AI enhancer offline", "error");
    } finally {
      setEnhancingTexts(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "analyze",
          resumeData,
          userType: useResumeStore.getState().userType || "student"
        })
      });
      const result = await res.json();
      if (result.score !== undefined) {
        setAnalysisData(result.score, result.analysis, result.resumeDNA, result.skillGap);
        triggerToast("Resume analyzed successfully!");
      } else {
        triggerToast("Failed to analyze resume", "error");
      }
    } catch {
      triggerToast("AI Analysis engine offline", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (step === 6 && !useResumeStore.getState().resumeScore && !analyzing) {
      handleRunAnalysis();
    }
  }, [step]);

  // AI Summary Enhancement
  const handleEnhanceSummary = async () => {
    if (!resumeData.personalInfo.fullName) {
      triggerToast("Please add your name first", "error");
      return;
    }
    setAiLoading(prev => ({ ...prev, summary: true }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "summary",
          fullName: resumeData.personalInfo.fullName,
          title: resumeData.experience[0]?.title || "Software Professional",
          company: resumeData.experience[0]?.company || "",
          skills: resumeData.skills.technical,
          existingSummary: resumeData.personalInfo.summary
        })
      });
      const data = await res.json();
      if (data.summary) {
        updatePersonalInfo({ summary: data.summary });
        triggerToast("Summary enhanced successfully!");
      }
    } catch {
      triggerToast("AI helper is offline", "error");
    } finally {
      setAiLoading(prev => ({ ...prev, summary: false }));
    }
  };

  // AI Bullets Generation
  const handleGenerateBullets = async (expId: string, title: string, company: string) => {
    if (!title) {
      triggerToast("Please add a Job Title first", "error");
      return;
    }
    setAiLoading(prev => ({ ...prev, [expId]: true }));
    try {
      const exp = resumeData.experience.find(e => e.id === expId);
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "bullets",
          title,
          company,
          duration: exp?.duration || "",
          existingBullets: exp?.bullets || []
        })
      });
      const data = await res.json();
      if (data.bullets) {
        updateExperience(expId, { bullets: data.bullets });
        triggerToast("Bullets generated with metrics!");
      }
    } catch {
      triggerToast("AI helper is offline", "error");
    } finally {
      setAiLoading(prev => ({ ...prev, [expId]: false }));
    }
  };

  // Run Job Matcher
  const handleJobMatch = async () => {
    if (!jobDesc.trim()) {
      triggerToast("Please paste a job description first", "error");
      return;
    }
    setAiLoading(prev => ({ ...prev, match: true }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "match",
          resumeData,
          jobDesc
        })
      });
      const data = await res.json();
      setMatchResult(data);
      triggerToast("ATS Job analysis complete!");
    } catch {
      triggerToast("AI engine offline", "error");
    } finally {
      setAiLoading(prev => ({ ...prev, match: false }));
    }
  };

  // Generate Interview Questions
  const handleGenerateInterview = async () => {
    setAiLoading(prev => ({ ...prev, interview: true }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "interview",
          resumeData,
          jobDesc
        })
      });
      const data = await res.json();
      setInterviewQs(data.questions || []);
      triggerToast("Mock interview questions ready!");
    } catch {
      triggerToast("AI coach is offline", "error");
    } finally {
      setAiLoading(prev => ({ ...prev, interview: false }));
    }
  };

  // Generate Cover Letter
  const handleGenerateCover = async () => {
    setAiLoading(prev => ({ ...prev, cover: true }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "cover-letter",
          resumeData,
          jobDesc
        })
      });
      const data = await res.json();
      setCoverLetter(data.coverLetter || "");
      triggerToast("Cover letter created!");
    } catch {
      triggerToast("AI helper offline", "error");
    } finally {
      setAiLoading(prev => ({ ...prev, cover: false }));
    }
  };

  // Roast Resume DNA
  const handleRoastResume = async () => {
    setAiLoading(prev => ({ ...prev, roast: true }));
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "roast",
          resumeData
        })
      });
      const data = await res.json();
      setRoastResult(data);
      setActivePanel("coach");
      triggerToast("Recruiter review completed!");
    } catch {
      triggerToast("Recruiter simulator offline", "error");
    } finally {
      setAiLoading(prev => ({ ...prev, roast: false }));
    }
  };

  // Download PDF
  const handleDownloadPdf = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume`,
    onAfterPrint: () => triggerToast("PDF downloaded successfully!"),
    onPrintError: () => triggerToast("Failed to download PDF", "error"),
  });

  // Download DOCX
  const handleDownloadDocx = async () => {
    if (!resumeId) return;
    triggerToast("Generating MS Word document...", "success");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: resumeId,
          format: "docx"
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        triggerToast("Word document downloaded!");
      }
    } catch {
      triggerToast("Failed to export Word document", "error");
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)] relative bg-[#07070f]">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 text-sm font-semibold border ${
              toast.type === "error" 
                ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}
          >
            {toast.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR - Navigation & Progress */}
      <div className="w-64 border-r border-slate-900 bg-slate-950/40 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-12 w-12 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-smooth" />
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400 font-medium">ATS Strength</span>
              <span className="text-xs font-bold text-indigo-400">{atsScore}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
                style={{ width: `${atsScore}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
              <span>{atsScore < 70 ? "Needs enhancement" : "Interview Ready!"}</span>
              <span className="capitalize text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                {autosaveStatus === "saved" ? "Autosaved" : "Saving..."}
              </span>
            </div>
          </div>

          {/* Navigation Steps */}
          <div className="space-y-1">
            {STEPS.map((s) => {
              const StepIcon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-smooth text-xs group relative ${
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/15" 
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                  }`}
                >
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 border ${
                    isActive 
                      ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400" 
                      : isCompleted
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-slate-900 border-slate-800 text-slate-500"
                  }`}>
                    {isCompleted ? <Check className="h-3 w-3" /> : <StepIcon className="h-3.5 w-3.5" />}
                  </div>
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 hidden lg:block transition-smooth">{s.desc}</div>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick actions / Roast */}
        <div className="space-y-2">
          <button 
            onClick={handleRoastResume}
            disabled={aiLoading.roast}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 font-bold text-xs transition-smooth"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{aiLoading.roast ? "Roasting..." : "🔥 Roast My Resume"}</span>
          </button>
        </div>
      </div>

      {/* CENTER PANEL - Forms & Inputs */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
        <div className="max-w-3xl mx-auto">
          {/* Header step info */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {React.createElement(STEPS[step].icon, { className: "h-5 w-5 text-indigo-400" })}
                <span>{STEPS[step].name} Section</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">{STEPS[step].desc}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={undo} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 transition-smooth">
                Undo
              </button>
              <button onClick={redo} className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-900 transition-smooth">
                Redo
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* STEP 0: USER TYPE */}
              {step === 0 && (
                <div className="space-y-6 max-w-2xl mx-auto text-center py-4">
                  <h3 className="text-2xl font-bold text-white mb-2">Select Your Career Stage</h3>
                  <p className="text-sm text-slate-400 mb-8">
                    We customize your resume layout, prioritize sections, and tailor AI insights to match your background.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { 
                        id: "student", 
                        name: "Student", 
                        icon: BookOpen, 
                        color: "border-sky-500/20 text-sky-400 bg-sky-500/5", 
                        hoverColor: "hover:border-sky-500/40 hover:bg-sky-500/10",
                        desc: "Currently enrolled in a degree program. Prioritizes education, academic projects, and certifications." 
                      },
                      { 
                        id: "fresher", 
                        name: "Fresher", 
                        icon: Sparkles, 
                        color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5", 
                        hoverColor: "hover:border-emerald-500/40 hover:bg-emerald-500/10",
                        desc: "Recent graduate looking for entry-level positions. Prioritizes personal projects, skills, and internships." 
                      },
                      { 
                        id: "experienced", 
                        name: "Experienced Professional", 
                        icon: Briefcase, 
                        color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5", 
                        hoverColor: "hover:border-indigo-500/40 hover:bg-indigo-500/10",
                        desc: "Mid-to-senior level professional. Prioritizes professional work history, achievements, and leadership." 
                      },
                      { 
                        id: "switcher", 
                        name: "Career Switcher", 
                        icon: RefreshCw, 
                        color: "border-amber-500/20 text-amber-400 bg-amber-500/5", 
                        hoverColor: "hover:border-amber-500/40 hover:bg-amber-500/10",
                        desc: "Transitioning to a new industry. Prioritizes transferable skills, bootcamps, and targeted projects." 
                      }
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = userType === t.id;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setUserType(t.id as any);
                            triggerToast(`Career stage set to ${t.name}`);
                            setStep(1);
                          }}
                          className={`p-5 text-left rounded-2xl border transition-smooth flex gap-4 ${t.hoverColor} ${
                            isSelected 
                              ? "border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/5" 
                              : "bg-slate-950/40 border-slate-900 text-slate-400"
                          }`}
                        >
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected ? "bg-indigo-500/20 border-indigo-400 text-indigo-300" : t.color
                          }`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                              {t.name}
                              {isSelected && <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Active</span>}
                            </div>
                            <div className="text-xs text-slate-500 mt-1 leading-relaxed">{t.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 1: PROFILE */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={resumeData.personalInfo.fullName} 
                        onChange={(e) => updatePersonalInfo({ fullName: e.target.value })} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="Alexander Wright"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email" 
                        value={resumeData.personalInfo.email} 
                        onChange={(e) => updatePersonalInfo({ email: e.target.value })} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="alexander.wright@tech.com"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="text" 
                        value={resumeData.personalInfo.phone} 
                        onChange={(e) => updatePersonalInfo({ phone: e.target.value })} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="+1 (555) 234-5678"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Location</label>
                      <input 
                        type="text" 
                        value={resumeData.personalInfo.location} 
                        onChange={(e) => updatePersonalInfo({ location: e.target.value })} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Website Portfolio</label>
                      <input 
                        type="text" 
                        value={resumeData.personalInfo.website} 
                        onChange={(e) => updatePersonalInfo({ website: e.target.value })} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="https://alexwright.dev"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">LinkedIn URL</label>
                      <input 
                        type="text" 
                        value={resumeData.personalInfo.linkedin} 
                        onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })} 
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="linkedin.com/in/alexwright"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Professional Summary</label>
                      <button 
                        onClick={() => handleEnhanceText("summary", resumeData.personalInfo.summary, (enhanced) => updatePersonalInfo({ summary: enhanced }))}
                        disabled={enhancingTexts["summary"]}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-smooth"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>{enhancingTexts["summary"] ? "Enhancing..." : "✨ AI Enhance"}</span>
                      </button>
                    </div>
                    <textarea 
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth min-h-[120px]"
                      placeholder="Write a brief professional summary..."
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: EDUCATION */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Add degree history</span>
                    <button 
                      onClick={() => addEducation()}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-smooth"
                    >
                      + Add Education
                    </button>
                  </div>

                  {resumeData.education.length === 0 && (
                    <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm">
                      No education details added yet.
                    </div>
                  )}

                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">School / University</label>
                          <input 
                            type="text" 
                            value={edu.school} 
                            onChange={(e) => updateEducation(edu.id, { school: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="UC Berkeley"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Degree</label>
                          <input 
                            type="text" 
                            value={edu.degree} 
                            onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="B.S."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Field of Study</label>
                          <input 
                            type="text" 
                            value={edu.field} 
                            onChange={(e) => updateEducation(edu.id, { field: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="Computer Science"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Year</label>
                          <input 
                            type="text" 
                            value={edu.year} 
                            onChange={(e) => updateEducation(edu.id, { year: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="2016 - 2020"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2">
                        <div className="space-y-1 w-1/3">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">GPA (Optional)</label>
                          <input 
                            type="text" 
                            value={edu.gpa || ""} 
                            onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="e.g. 3.8/4.0"
                          />
                        </div>
                        <button 
                          onClick={() => removeEducation(edu.id)}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-smooth border border-rose-500/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 3: EXPERIENCE */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Add work experiences</span>
                    <button 
                      onClick={() => addExperience()}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-smooth"
                    >
                      + Add Experience
                    </button>
                  </div>

                  {resumeData.experience.length === 0 && (
                    <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm">
                      No experience details added yet.
                    </div>
                  )}

                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Job Title</label>
                          <input 
                            type="text" 
                            value={exp.title} 
                            onChange={(e) => updateExperience(exp.id, { title: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="Senior Software Engineer"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
                          <input 
                            type="text" 
                            value={exp.company} 
                            onChange={(e) => updateExperience(exp.id, { company: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="TechCorp Labs"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Duration</label>
                          <input 
                            type="text" 
                            value={exp.duration} 
                            onChange={(e) => updateExperience(exp.id, { duration: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="Jan 2021 - Present"
                          />
                        </div>
                      </div>

                      {/* Bullets */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Responsibilities & Impact</label>
                          <button 
                            onClick={() => handleGenerateBullets(exp.id, exp.title, exp.company)}
                            disabled={aiLoading[exp.id]}
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-smooth"
                          >
                            <Sparkles className="h-3 w-3" />
                            <span>{aiLoading[exp.id] ? "Generating..." : "✨ AI Generate"}</span>
                          </button>
                        </div>
                        {exp.bullets.map((b, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input 
                              type="text" 
                              value={b} 
                              onChange={(e) => updateExperienceBullet(exp.id, idx, e.target.value)} 
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none transition-smooth"
                              placeholder="Led development team to rewrite microservices API, increasing efficiency by 30%..."
                            />
                            <button
                              onClick={() => handleEnhanceText(`${exp.id}-${idx}`, b, (enhanced) => updateExperienceBullet(exp.id, idx, enhanced))}
                              disabled={enhancingTexts[`${exp.id}-${idx}`]}
                              className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-indigo-400 hover:bg-slate-900 transition-smooth shrink-0"
                              title="AI Enhance Bullet"
                            >
                              {enhancingTexts[`${exp.id}-${idx}`] ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => addExperienceBullet(exp.id)}
                          className="text-[10px] font-semibold px-2 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-smooth"
                        >
                          + Add Bullet Point
                        </button>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button 
                          onClick={() => removeExperience(exp.id)}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-smooth border border-rose-500/10"
                        >
                          Remove Role
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 4: PROJECTS */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Add highlight projects</span>
                    <button 
                      onClick={() => addProject()}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-smooth"
                    >
                      + Add Project
                    </button>
                  </div>

                  {resumeData.projects.length === 0 && (
                    <div className="text-center py-12 bg-slate-950/20 rounded-2xl border border-dashed border-slate-800 text-slate-500 text-sm">
                      No projects added yet.
                    </div>
                  )}

                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Project Name</label>
                          <input 
                            type="text" 
                            value={proj.name} 
                            onChange={(e) => updateProject(proj.id, { name: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="CloudOps Orchestration"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Tech Stack</label>
                          <input 
                            type="text" 
                            value={proj.tech} 
                            onChange={(e) => updateProject(proj.id, { tech: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="Golang, Docker, Kubernetes"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                            <button 
                              onClick={() => handleEnhanceText(proj.id, proj.description, (enhanced) => updateProject(proj.id, { description: enhanced }))}
                              disabled={enhancingTexts[proj.id]}
                              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-smooth"
                            >
                              <Sparkles className="h-3 w-3" />
                              <span>{enhancingTexts[proj.id] ? "Enhancing..." : "✨ AI Enhance"}</span>
                            </button>
                          </div>
                          <textarea 
                            value={proj.description} 
                            onChange={(e) => updateProject(proj.id, { description: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-smooth min-h-[60px]"
                            placeholder="Describe what you built and the technical impact..."
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Project Link (Optional)</label>
                          <input 
                            type="text" 
                            value={proj.link || ""} 
                            onChange={(e) => updateProject(proj.id, { link: e.target.value })} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none transition-smooth"
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button 
                          onClick={() => removeProject(proj.id)}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-1 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg transition-smooth border border-rose-500/10"
                        >
                          Remove Project
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 5: SKILLS */}
              {step === 5 && (
                <div className="space-y-6">
                  {/* Technical Skills */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Technical / Hard Skills</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {resumeData.skills.technical.map((s, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg font-medium">
                          <span>{s}</span>
                          <button onClick={() => removeSkill("technical", idx)} className="hover:text-indigo-200 font-bold ml-1 text-[11px]">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={skillInputs.technical} 
                        onChange={(e) => setSkillInputs(prev => ({ ...prev, technical: e.target.value }))} 
                        onKeyDown={(e) => e.key === "Enter" && (addSkill("technical", skillInputs.technical), setSkillInputs(prev => ({ ...prev, technical: "" })))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="Add hard skill e.g. Kubernetes, React..."
                      />
                      <button 
                        onClick={() => (addSkill("technical", skillInputs.technical), setSkillInputs(prev => ({ ...prev, technical: "" })))}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Languages</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {resumeData.skills.languages.map((l, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-medium">
                          <span>{l}</span>
                          <button onClick={() => removeSkill("languages", idx)} className="hover:text-emerald-200 font-bold ml-1 text-[11px]">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={skillInputs.languages} 
                        onChange={(e) => setSkillInputs(prev => ({ ...prev, languages: e.target.value }))} 
                        onKeyDown={(e) => e.key === "Enter" && (addSkill("languages", skillInputs.languages), setSkillInputs(prev => ({ ...prev, languages: "" })))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="Add language e.g. English, French..."
                      />
                      <button 
                        onClick={() => (addSkill("languages", skillInputs.languages), setSkillInputs(prev => ({ ...prev, languages: "" })))}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Certifications</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(resumeData.certifications || []).map((c, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-medium">
                          <span>{c}</span>
                          <button onClick={() => removeCertification(idx)} className="hover:text-amber-200 font-bold ml-1 text-[11px]">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={certInput} 
                        onChange={(e) => setCertInput(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && (addCertification(certInput), setCertInput(""))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="Add certification e.g. AWS Certified Solutions Architect..."
                      />
                      <button 
                        onClick={() => (addCertification(certInput), setCertInput(""))}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Achievements</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(resumeData.achievements || []).map((a, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg font-medium">
                          <span>{a}</span>
                          <button onClick={() => removeAchievement(idx)} className="hover:text-sky-200 font-bold ml-1 text-[11px]">&times;</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={achInput} 
                        onChange={(e) => setAchInput(e.target.value)} 
                        onKeyDown={(e) => e.key === "Enter" && (addAchievement(achInput), setAchInput(""))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none transition-smooth"
                        placeholder="Add achievement e.g. Won 1st place at TechHack 2025..."
                      />
                      <button 
                        onClick={() => (addAchievement(achInput), setAchInput(""))}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-700"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: AI ANALYSIS */}
              {step === 6 && (
                <div className="space-y-6">
                  {/* Analysis Status */}
                  {analyzing ? (
                    <div className="text-center py-20 bg-slate-950/40 rounded-2xl border border-slate-900 flex flex-col items-center justify-center gap-4">
                      <RefreshCw className="h-10 w-10 text-indigo-400 animate-spin" />
                      <div className="text-sm font-semibold text-slate-300">Recruiter AI is parsing your resume...</div>
                      <div className="text-xs text-slate-500">Checking keywords, matching career stage standards, and scoring DNA metrics.</div>
                    </div>
                  ) : !useResumeStore.getState().resumeScore ? (
                    <div className="text-center py-20 bg-slate-950/40 rounded-2xl border border-slate-900 flex flex-col items-center justify-center gap-4">
                      <Zap className="h-10 w-10 text-amber-400" />
                      <div className="text-sm font-semibold text-slate-300">No analysis data found</div>
                      <button 
                        onClick={handleRunAnalysis}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-smooth"
                      >
                        Run AI Audit
                      </button>
                    </div>
                  ) : (() => {
                    const score = useResumeStore.getState().resumeScore || 0;
                    const analysis = useResumeStore.getState().analysis || { missingSkills: [], weakSections: [], keywordOptimization: [], suggestions: [], improvementTips: [] };
                    const dna = useResumeStore.getState().resumeDNA || { leadership: 50, technicalDepth: 50, collaboration: 50 };
                    const gap = useResumeStore.getState().skillGap || { identifiedGaps: [], actionableFeedback: "" };

                    return (
                      <div className="space-y-6">
                        {/* Score and DNA Summary Card */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Score Ring */}
                          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl text-center flex flex-col items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
                            <div className="relative h-28 w-28 flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="#0f172a" strokeWidth="8" fill="transparent" />
                                <circle 
                                  cx="50" 
                                  cy="50" 
                                  r="40" 
                                  stroke={score > 80 ? "#10b981" : score > 60 ? "#f59e0b" : "#f43f5e"} 
                                  strokeWidth="8" 
                                  fill="transparent" 
                                  strokeDasharray="251.2" 
                                  strokeDashoffset={251.2 - (251.2 * score) / 100}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000"
                                />
                              </svg>
                              <div className="absolute text-3xl font-extrabold text-white">{score}</div>
                            </div>
                            <div className="text-xs font-bold text-slate-300 mt-4 uppercase tracking-wider">ATS MATCH RATE</div>
                            <div className="text-[10px] text-slate-500 mt-1">Goal: 85+ score</div>
                          </div>

                          {/* DNA Stats */}
                          <div className="md:col-span-2 p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Resume DNA Profile</h4>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 capitalize font-bold">
                                  {userType || "Student"}
                                </span>
                              </div>
                              <div className="space-y-3">
                                {[
                                  { name: "Leadership & Ownership", val: dna.leadership, color: "from-indigo-500 to-purple-500" },
                                  { name: "Technical Depth & Complexity", val: dna.technicalDepth, color: "from-sky-500 to-blue-500" },
                                  { name: "Collaboration & Teamwork", val: dna.collaboration, color: "from-emerald-500 to-teal-500" }
                                ].map((item, i) => (
                                  <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs font-medium">
                                      <span className="text-slate-300">{item.name}</span>
                                      <span className="text-slate-400">{item.val}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                                        style={{ width: `${item.val}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <button 
                              onClick={handleRunAnalysis}
                              className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl transition-smooth"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span>Refresh Diagnostics</span>
                            </button>
                          </div>
                        </div>

                        {/* Recruiter Review / Skill Gap */}
                        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Recruiter Skill Gap Assessment</h4>
                            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-900">
                              {gap.actionableFeedback || "No specific feedback generated. Add more detailed sections to populate feedback."}
                            </p>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold text-rose-400 uppercase mb-2 tracking-wider">Identified Skill Gaps:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {gap.identifiedGaps?.length > 0 ? (
                                gap.identifiedGaps.map((g: string, idx: number) => (
                                  <span key={idx} className="text-[10px] px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold">
                                    {g}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500">No major gaps identified! Good job.</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Audit Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Weak Sections & Suggestions */}
                          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-2">Vulnerabilities</h4>
                            
                            <div>
                              <div className="text-[9px] font-bold text-amber-500 uppercase mb-1.5">Weak Sections:</div>
                              {analysis.weakSections?.length > 0 ? (
                                analysis.weakSections.map((w: string, idx: number) => (
                                  <div key={idx} className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                    <span>{w}</span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-xs text-slate-500">All sections look solid!</span>
                              )}
                            </div>

                            <div className="pt-2 border-t border-slate-900/60">
                              <div className="text-[9px] font-bold text-indigo-400 uppercase mb-1.5">Improvement Tips:</div>
                              {analysis.improvementTips?.map((tip: string, idx: number) => (
                                <div key={idx} className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                                  • {tip}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Missing Keywords & Suggestions */}
                          <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl space-y-3">
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-2">Target Keywords</h4>
                            
                            <div>
                              <div className="text-[9px] font-bold text-indigo-400 uppercase mb-2 tracking-wider">Suggested ATS Keywords:</div>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.missingSkills?.length > 0 ? (
                                  analysis.missingSkills.map((s: string, idx: number) => (
                                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                                      {s}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-500">No suggested keywords.</span>
                                )}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900/60">
                              <div className="text-[9px] font-bold text-emerald-400 uppercase mb-1.5">Key Optimizations:</div>
                              {analysis.keywordOptimization?.map((k: string, idx: number) => (
                                <div key={idx} className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  <span>{k}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* STEP 7: FINALIZE */}
              {step === 7 && (
                <div className="space-y-6">
                  {/* Template Picker */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-3">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Select Theme & Layout Template</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { id: "nova", name: "Nova (ATS Pro)", desc: "High readability, clean" },
                        { id: "solstice", name: "Solstice", desc: "Minimal editorial design" },
                        { id: "atlas", name: "Atlas", desc: "Standard corporate style" },
                        { id: "modern", name: "Modern", desc: "Bold and clean look" },
                        { id: "classic", name: "Classic", desc: "Traditional Harvard style" },
                        { id: "tech", name: "Tech", desc: "Startup/Developer layout" },
                        { id: "executive", name: "Executive", desc: "Leadership focus" },
                        { id: "meridian", name: "Meridian (Sidebar)", desc: "Modern sidebar layout" },
                        { id: "vanguard", name: "Vanguard", desc: "Creative timeline layout" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTemplate(t.id)}
                          className={`p-3 text-left rounded-xl border transition-smooth ${
                            templateId === t.id 
                              ? "bg-indigo-500/10 border-indigo-500/30 text-slate-200" 
                              : "bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <div className="text-xs font-semibold">{t.name}</div>
                          <div className="text-[9px] text-slate-500 mt-1">{t.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Exports Panel */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Export Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button 
                        onClick={handleDownloadPdf}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-smooth shadow-lg shadow-indigo-600/10"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download PDF (High Res)</span>
                      </button>
                      <button 
                        onClick={handleDownloadDocx}
                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs transition-smooth border border-slate-800"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Download Word (.docx)</span>
                      </button>
                    </div>
                  </div>

                  {/* Job Matcher Panel */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Job Matching & Optimization</label>
                      <button 
                        onClick={handleJobMatch}
                        disabled={aiLoading.match}
                        className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-smooth"
                      >
                        {aiLoading.match ? "Matching..." : "🔎 Run Job Match"}
                      </button>
                    </div>
                    <textarea 
                      value={jobDesc}
                      onChange={(e) => setJobDesc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none transition-smooth min-h-[90px]"
                      placeholder="Paste the target job description here..."
                    />

                    {matchResult && (
                      <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300">ATS Keyword Match Score</span>
                          <span className={`text-sm font-bold ${matchResult.score > 75 ? "text-emerald-400" : "text-amber-400"}`}>{matchResult.score}%</span>
                        </div>
                        
                        <div>
                          <div className="text-[9px] font-bold text-rose-400 uppercase mb-1">Missing Keywords:</div>
                          <div className="flex flex-wrap gap-1">
                            {matchResult.missingKeywords?.map((k: string, idx: number) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-bold text-emerald-400 uppercase mb-1 font-semibold">Matched Keywords:</div>
                          <div className="flex flex-wrap gap-1">
                            {matchResult.matchedKeywords?.map((k: string, idx: number) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 space-y-1">
                          <div className="font-bold text-[9px] text-indigo-400 uppercase">Recommendations:</div>
                          {matchResult.suggestions?.map((s: string, idx: number) => (
                            <div key={idx}>→ {s}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interview Preparation */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Interview Preparation</label>
                      <button 
                        onClick={handleGenerateInterview}
                        disabled={aiLoading.interview}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-700"
                      >
                        {aiLoading.interview ? "Generating..." : "Generate Interview Questions"}
                      </button>
                    </div>

                    {interviewQs.length > 0 && (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {interviewQs.map((q, idx) => (
                          <div key={idx} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs font-semibold text-slate-200">{q.question}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold shrink-0">{q.type}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 border-t border-slate-900/60 pt-1">
                              <span className="font-bold text-[9px] text-emerald-400 uppercase block">Suggested STAR Approach:</span>
                              {q.approach}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cover Letter Panel */}
                  <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Cover Letter Generator</label>
                      <button 
                        onClick={handleGenerateCover}
                        disabled={aiLoading.cover}
                        className="text-xs font-semibold px-3 py-1.5 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition-smooth border border-slate-700"
                      >
                        {aiLoading.cover ? "Drafting..." : "Create Cover Letter"}
                      </button>
                    </div>

                    {coverLetter && (
                      <textarea 
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono focus:border-indigo-500 focus:outline-none transition-smooth min-h-[220px]"
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-900">
            <button 
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400 transition-smooth"
            >
              &larr; Back
            </button>
            <button 
              onClick={() => step < STEPS.length - 1 ? setStep(step + 1) : triggerToast("Your resume is complete and optimized!", "success")}
              className="text-xs font-bold px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95 transition-smooth shadow-lg shadow-indigo-600/10"
            >
              {step === STEPS.length - 1 ? "Complete" : "Continue &rarr;"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Preview, ATS Metrics, AI Recruiter Coach */}
      <div className="w-[380px] border-l border-slate-900 bg-slate-950/20 flex flex-col shrink-0">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-900 p-1 bg-slate-950/60">
          {[
            { id: "preview", name: "Preview" },
            { id: "score", name: "ATS Check" },
            { id: "coach", name: "AI Coach" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActivePanel(t.id as any)}
              className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition-smooth ${
                activePanel === t.id 
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* PREVIEW TAB */}
          {activePanel === "preview" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Document Preview</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400 uppercase font-bold">
                  {templateId}
                </span>
              </div>
              <div className="border border-slate-900 rounded-xl overflow-hidden shadow-2xl scale-[0.98] origin-top bg-white">
                <ResumeTemplate data={resumeData} templateId={templateId} themeConfig={themeConfig} scale={0.46} userType={userType} />
              </div>
              
              {/* Hidden Print Container */}
              <div style={{ display: "none" }}>
                <div ref={printRef}>
                  <ResumeTemplate data={resumeData} templateId={templateId} themeConfig={themeConfig} scale={1} userType={userType} />
                </div>
              </div>
            </div>
          )}

          {/* ATS CHECK TAB */}
          {activePanel === "score" && (
            <div className="space-y-6">
              <div className="text-center p-4 bg-slate-950/60 rounded-2xl border border-slate-900">
                <div className="text-4xl font-extrabold text-white font-mono">{atsScore}</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Overall ATS Suitability</div>
                
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mt-3">
                  <div 
                    className={`h-full rounded-full transition-smooth ${
                      atsScore > 80 ? "bg-emerald-500" : atsScore > 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${atsScore}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Completeness Audit</h4>
                {[
                  { name: "Name & Contact Info", done: !!resumeData.personalInfo.fullName && !!resumeData.personalInfo.email, tip: "Add full name and professional email" },
                  { name: "Contact Phone & Location", done: !!resumeData.personalInfo.phone && !!resumeData.personalInfo.location, tip: "Help recruiters reach you instantly" },
                  { name: "Professional Summary", done: resumeData.personalInfo.summary.length > 50, tip: "Add a 2-3 sentence overview" },
                  { name: "Work History Added", done: resumeData.experience.length > 0, tip: "Detail at least one job role" },
                  { name: "Education Details", done: resumeData.education.length > 0, tip: "List your degree program" },
                  { name: "Skills Segment", done: resumeData.skills.technical.length >= 4, tip: "List at least 4 key technical skills" },
                  { name: "Portfolio & Social Links", done: !!resumeData.personalInfo.website || !!resumeData.personalInfo.github, tip: "Link your GitHub or personal portfolio" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 p-3 rounded-xl bg-slate-950/40 border border-slate-900/60 text-xs">
                    {item.done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className={`font-semibold ${item.done ? "text-slate-300" : "text-slate-400"}`}>{item.name}</div>
                      {!item.done && <div className="text-[10px] text-slate-500 mt-1">{item.tip}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI COACH TAB */}
          {activePanel === "coach" && (
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold mb-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>AI Recruiter Insights</span>
              </div>

              {roastResult ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 text-xs text-amber-400 space-y-2">
                    <div className="font-bold flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      <span> Brutal Recruiter Review:</span>
                    </div>
                    <p className="italic leading-relaxed">"{roastResult.roast}"</p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Critical Corrections:</div>
                    {roastResult.improvements?.map((imp: string, idx: number) => (
                      <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs flex gap-2">
                        <Star className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { title: "Quantify Impact", text: "Recruiters love metrics. Instead of 'built APIs', write 'designed APIs that optimized response times by 35%'." },
                    { title: "Start With Action Verbs", text: "Begin every bullet point with strong verbs: Led, Architected, Refactored, Accelerated, Developed." },
                    { title: "Group Skills Clearly", text: "Separate your frontend, backend, database, and devops focus to help recruiters parse your profile." }
                  ].map((tip, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-xs space-y-1">
                      <div className="font-semibold text-slate-300 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{tip.title}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{tip.text}</p>
                    </div>
                  ))}
                  <button 
                    onClick={handleRoastResume}
                    disabled={aiLoading.roast}
                    className="w-full mt-2 py-2 px-3 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 text-xs font-bold transition-smooth"
                  >
                    {aiLoading.roast ? "Consulting Recruiter..." : "Consult AI Recruiter"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
