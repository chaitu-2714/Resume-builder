"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { Sparkles, FileText, Plus, Copy, Trash2, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [resumeTypeModal, setResumeTypeModal] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await fetch("/api/resumes");
        const data = await res.json();
        if (data.resumes) setResumes(data.resumes);
      } catch (e) {
        console.error("Failed to load resumes", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleCreateResume = async (type: string) => {
    setIsLoading(true);
    setResumeTypeModal(false);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${type} Resume`,
          templateId: "nova",
          data: {
            personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", summary: "" },
            education: [],
            skills: { technical: [], soft: [], languages: [] },
            projects: [],
            experience: [],
            certifications: [],
            achievements: []
          }
        })
      });
      const data = await res.json();
      if (data.resume) {
        router.push(`/resume-builder/${data.resume.id}`);
      }
    } catch (e) {
      console.error("Failed to create resume", e);
      setIsLoading(false);
    }
  };

  const handleDuplicateResume = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.resume) {
        setResumes(prev => [data.resume, ...prev]);
      }
    } catch (e) {
      console.error("Failed to duplicate resume", e);
    }
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setResumes(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error("Failed to delete resume", e);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#05050a] relative">
      <header className="h-16 border-b border-slate-900/60 bg-slate-950/30 backdrop-blur-md px-6 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            ✦
          </div>
          <span className="font-bold text-sm tracking-tight text-white">SmartResumeBuilder</span>
        </div>
        <AuthButton />
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12 md:py-20 z-10 overflow-y-auto">
        <div className="w-full max-w-5xl space-y-8 animate-fade-in">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">My Resumes</h1>
              <p className="text-xs text-slate-400 mt-1">Manage and optimize your templates</p>
            </div>
            <button 
              onClick={() => setResumeTypeModal(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-smooth shadow-lg shadow-indigo-600/10"
            >
              <Plus className="h-4 w-4" />
              <span>Create Resume</span>
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-2xl border border-slate-900 bg-slate-950/40 animate-pulse" />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-900 rounded-2xl">
              <FileText className="h-12 w-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-300">No Resumes Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm text-center mt-2 mb-6">Create your first AI-powered resume and stand out from the crowd.</p>
              <button 
                onClick={() => setResumeTypeModal(true)}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-smooth"
              >
                Create Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((r) => (
                <div 
                  key={r.id}
                  onClick={() => router.push(`/resume-builder/${r.id}`)}
                  className="p-5 rounded-2xl border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-smooth group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-smooth" />
                  
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 transition-smooth">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1.5 z-10 relative">
                      <button 
                        onClick={(e) => handleDuplicateResume(r.id, e)}
                        title="Duplicate Resume"
                        className="p-1.5 rounded-lg border border-slate-900 text-slate-500 hover:text-slate-300 hover:bg-slate-900 transition-smooth"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={(e) => handleDeleteResume(r.id, e)}
                        title="Delete Resume"
                        className="p-1.5 rounded-lg border border-slate-900 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-smooth"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold text-slate-200 group-hover:text-white transition-smooth">{r.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Updated {new Date(r.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-900/60 flex justify-between items-center text-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Nova Template</span>
                    <span className="text-indigo-400 font-semibold group-hover:translate-x-1 transition-smooth flex items-center gap-0.5">
                      <span>Edit</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {resumeTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setResumeTypeModal(false)} />
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c0c16] p-6 shadow-2xl z-10 animate-fade-in">
            <h2 className="text-lg font-bold text-white mb-2">Choose Your Career Level</h2>
            <p className="text-xs text-slate-400 mb-6">Select a profile type to customize your guided experience</p>
            
            <div className="space-y-3">
              {[
                { id: "Fresher", name: "Student & Entry-Level", desc: "Highlight courses, academic projects, and certifications" },
                { id: "Experienced", name: "Experienced Professional", desc: "Optimize metrics, work accomplishments, and technical leadership" },
                { id: "Career Switcher", name: "Career Switcher", desc: "Bridge transferable skills and key project highlights" }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleCreateResume(type.id)}
                  className="w-full text-left p-4 rounded-xl border border-slate-900 bg-slate-950/50 hover:border-indigo-500/30 hover:bg-slate-950 transition-smooth group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-400 transition-smooth">{type.name}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{type.desc}</div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setResumeTypeModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-smooth"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
