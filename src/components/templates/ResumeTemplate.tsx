import React from "react";
import { ResumeData, ThemeConfig } from "@/lib/store";

interface ResumeTemplateProps {
  data: ResumeData;
  templateId: string;
  themeConfig?: ThemeConfig;
  scale?: number;
  userType?: string | null;
}

export function getSectionOrder(userType: string | null): string[] {
  if (!userType) return ["experience", "projects", "education", "skills", "certifications", "achievements"];
  const type = userType.toLowerCase();
  if (type === "student") {
    return ["education", "projects", "skills", "certifications", "achievements", "experience"];
  }
  if (type === "fresher") {
    return ["projects", "skills", "experience", "certifications", "education", "achievements"];
  }
  if (type === "experienced" || type === "experienced professional") {
    return ["experience", "achievements", "skills", "education", "projects", "certifications"];
  }
  if (type === "switcher" || type === "career switcher") {
    return ["skills", "projects", "education", "experience", "certifications", "achievements"];
  }
  return ["experience", "projects", "education", "skills", "certifications", "achievements"];
}

export function ResumeTemplate({ data, templateId, themeConfig, scale = 1, userType = null }: ResumeTemplateProps) {
  const p = data.personalInfo || { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", summary: "" };
  const education = data.education || [];
  const experience = data.experience || [];
  const projects = data.projects || [];
  const skills = data.skills || { technical: [], soft: [], languages: [] };
  const certifications = data.certifications || [];
  const achievements = data.achievements || [];

  const primary = themeConfig?.accentColor || themeConfig?.primaryColor || "#6366f1";
  const darkText = "#1e293b";
  const lightText = "#64748b";

  const customFont = themeConfig?.fontFamily 
    ? `'${themeConfig.fontFamily}', sans-serif`
    : templateId === "tech" 
      ? "'Fira Code', 'Courier New', monospace"
      : templateId === "classic" 
        ? "'Times New Roman', Times, serif"
        : templateId === "solstice"
          ? "'Playfair Display', serif"
          : templateId === "vanguard"
            ? "'Outfit', sans-serif"
            : "'Inter', sans-serif";

  // Base styled wrapper
  const baseContainerStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    width: "100%",
    minHeight: "842px",
    backgroundColor: "#ffffff",
    color: darkText,
    lineHeight: themeConfig?.lineHeight || "1.5",
    fontSize: themeConfig?.fontSize || "12px",
    boxSizing: "border-box",
    fontFamily: customFont,
  };

  const sectionOrder = getSectionOrder(userType);

  // ─── NOVA (ATS PRO) ───────────────────────────────────────────
  if (templateId === "nova") {
    const renderSection = (sec: string) => {
      switch (sec) {
        case "experience":
          return experience.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>
                Professional Experience
              </h2>
              {experience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                    <span style={{ color: "#0f172a" }}>{exp.title}</span>
                    <span style={{ color: lightText, fontSize: "11px" }}>{exp.duration}</span>
                  </div>
                  <div style={{ color: primary, fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>{exp.company}</div>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155" }}>
                    {exp.bullets.map((bullet, idx) => bullet ? <li key={idx} style={{ marginBottom: "2px" }}>{bullet}</li> : null)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "projects":
          return projects.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>
                Key Projects
              </h2>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "8px" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>
                    {proj.name} {proj.tech && <span style={{ color: lightText, fontWeight: 400, fontSize: "11px" }}>— ({proj.tech})</span>}
                  </div>
                  <p style={{ margin: "2px 0 0 0", color: "#334155" }}>{proj.description}</p>
                  {proj.link && <div style={{ fontSize: "10px", color: primary }}>Project Link: {proj.link}</div>}
                </div>
              ))}
            </div>
          );
        case "education":
          return education.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "6px" }}>
                  <div style={{ fontWeight: 700, color: "#0f172a" }}>{edu.degree} in {edu.field}</div>
                  <div style={{ color: "#334155", fontSize: "11px" }}>{edu.school} | {edu.year}</div>
                  {edu.gpa && <div style={{ fontSize: "10px", color: lightText }}>GPA: {edu.gpa}</div>}
                </div>
              ))}
            </div>
          );
        case "skills":
          return (skills.technical.length > 0 || skills.languages.length > 0) && (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>
                Skills & Languages
              </h2>
              {skills.technical.length > 0 && (
                <div style={{ marginBottom: "6px" }}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#0f172a" }}>Technical:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "2px" }}>
                    {skills.technical.map((s, idx) => (
                      <span key={idx} style={{ background: "#ede9fe", color: "#5b21b6", padding: "1px 5px", borderRadius: "3px", fontSize: "10px" }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {skills.languages.length > 0 && (
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "#0f172a" }}>Languages:</div>
                  <div style={{ color: "#334155", fontSize: "11px" }}>{skills.languages.join(", ")}</div>
                </div>
              )}
            </div>
          );
        case "certifications":
          return certifications.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>
                Certifications
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {certifications.map((c, idx) => (
                  <span key={idx} style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "1px 5px", borderRadius: "3px", fontSize: "10px" }}>{c}</span>
                ))}
              </div>
            </div>
          );
        case "achievements":
          return achievements.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>
                Key Achievements
              </h2>
              <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155" }}>
                {achievements.map((ach, idx) => <li key={idx} style={{ marginBottom: "2px" }}>{ach}</li>)}
              </ul>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ ...baseContainerStyle, padding: "40px" }}>
        {/* Name and Header */}
        <div style={{ borderBottom: `2px solid ${primary}`, paddingBottom: "12px", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
            {p.fullName || "John Doe"}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "6px", color: lightText, fontSize: "11px" }}>
            {p.email && <span>✉ {p.email}</span>}
            {p.phone && <span>✆ {p.phone}</span>}
            {p.location && <span>⚲ {p.location}</span>}
            {p.website && <span>🔗 {p.website}</span>}
            {p.linkedin && <span>in {p.linkedin}</span>}
            {p.github && <span>git {p.github}</span>}
          </div>
        </div>

        {/* Summary */}
        {p.summary && (
          <div style={{ marginBottom: "16px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Professional Summary
            </h2>
            <p style={{ color: "#334155", margin: 0 }}>{p.summary}</p>
          </div>
        )}

        {/* Sorted Sections */}
        {sectionOrder.map((sec) => (
          <React.Fragment key={sec}>{renderSection(sec)}</React.Fragment>
        ))}
      </div>
    );
  }

  // ─── MERIDIAN (MODERN SIDEBAR) ─────────────────────────────────
  if (templateId === "meridian") {
    const sidebarSections = sectionOrder.filter(s => ["skills", "education", "certifications"].includes(s));
    const mainSections = sectionOrder.filter(s => ["experience", "projects", "achievements"].includes(s));

    const renderSidebarSection = (sec: string) => {
      switch (sec) {
        case "skills":
          return skills.technical.length > 0 && (
            <div>
              <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Expertise
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {skills.technical.map((s, idx) => (
                  <span key={idx} style={{ background: "rgba(255,255,255,0.1)", color: "#ffffff", padding: "2px 6px", borderRadius: "4px", fontSize: "10px" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        case "education":
          return education.length > 0 && (
            <div>
              <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Education
              </h3>
              {education.map((edu) => (
                <div key={edu.id} style={{ marginBottom: "8px", fontSize: "10px" }}>
                  <div style={{ fontWeight: 700 }}>{edu.school}</div>
                  <div style={{ color: "#a7f3d0" }}>{edu.degree}</div>
                  <div style={{ color: "#6ee7b7" }}>{edu.year}</div>
                </div>
              ))}
            </div>
          );
        case "certifications":
          return certifications.length > 0 && (
            <div>
              <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                Certificates
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "10px", color: "#a7f3d0" }}>
                {certifications.map((c, idx) => <div key={idx}>✓ {c}</div>)}
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    const renderMainSection = (sec: string) => {
      switch (sec) {
        case "experience":
          return experience.length > 0 && (
            <div>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#064e3b", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #d1fae5", paddingBottom: "4px", marginBottom: "10px" }}>
                Experience
              </h2>
              {experience.map((exp) => (
                <div key={exp.id} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, color: "#064e3b" }}>{exp.title}</span>
                    <span style={{ color: lightText, fontSize: "11px" }}>{exp.duration}</span>
                  </div>
                  <div style={{ color: "#10b981", fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>{exp.company}</div>
                  <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155", fontSize: "11px" }}>
                    {exp.bullets.map((b, idx) => b ? <li key={idx} style={{ marginBottom: "2px" }}>{b}</li> : null)}
                  </ul>
                </div>
              ))}
            </div>
          );
        case "projects":
          return projects.length > 0 && (
            <div>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#064e3b", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #d1fae5", paddingBottom: "4px", marginBottom: "10px" }}>
                Featured Projects
              </h2>
              {projects.map((proj) => (
                <div key={proj.id} style={{ marginBottom: "8px", fontSize: "11px" }}>
                  <div style={{ fontWeight: 700, color: "#064e3b" }}>{proj.name}</div>
                  <p style={{ margin: "2px 0", color: "#334155" }}>{proj.description}</p>
                  {proj.tech && <div style={{ fontSize: "10px", color: "#10b981" }}>Tech: {proj.tech}</div>}
                </div>
              ))}
            </div>
          );
        case "achievements":
          return achievements.length > 0 && (
            <div>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: "#064e3b", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #d1fae5", paddingBottom: "4px", marginBottom: "10px" }}>
                Key Achievements
              </h2>
              <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155", fontSize: "11px" }}>
                {achievements.map((ach, idx) => <li key={idx} style={{ marginBottom: "2px" }}>{ach}</li>)}
              </ul>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ ...baseContainerStyle, display: "flex" }}>
        {/* Left Sidebar */}
        <div style={{ width: "33%", background: primary === "#6366f1" ? "#064e3b" : primary, color: "#f0fdf4", padding: "30px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", margin: 0, lineHeight: "1.2" }}>
              {p.fullName || "John Doe"}
            </h1>
            <div style={{ fontSize: "11px", color: "#a7f3d0", marginTop: "4px", fontWeight: 500 }}>
              {experience[0]?.title || "Professional"}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ fontSize: "11px", fontWeight: 700, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
              Contact
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "10px", color: "#d1fae5" }}>
              {p.email && <div>✉ {p.email}</div>}
              {p.phone && <div>✆ {p.phone}</div>}
              {p.location && <div>⚲ {p.location}</div>}
              {p.linkedin && <div>🔗 {p.linkedin}</div>}
            </div>
          </div>

          {sidebarSections.map((sec) => (
            <React.Fragment key={sec}>{renderSidebarSection(sec)}</React.Fragment>
          ))}
        </div>

        {/* Right Main Panel */}
        <div style={{ flex: 1, padding: "30px 25px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {p.summary && (
            <div style={{ borderLeft: `3px solid ${primary}`, paddingLeft: "10px", margin: 0 }}>
              <p style={{ fontStyle: "italic", color: "#334155", margin: 0, fontSize: "13px", lineHeight: "1.5" }}>
                {p.summary}
              </p>
            </div>
          )}

          {mainSections.map((sec) => (
            <React.Fragment key={sec}>{renderMainSection(sec)}</React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  // ─── VANGUARD (CREATIVE TIMELINE) ─────────────────────────────────
  if (templateId === "vanguard") {
    const renderVanguardSection = (sec: string) => {
      switch (sec) {
        case "experience":
          return experience.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Experience</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </h2>
              <div style={{ position: "relative", borderLeft: `1.5px solid #cbd5e1`, marginLeft: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                {experience.map((exp) => (
                  <div key={exp.id} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "-26.5px", top: "4px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: primary, border: "2px solid #ffffff", boxShadow: "0 0 0 1px #cbd5e1" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", alignItems: "baseline", marginBottom: "2px" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>{exp.title}</span>
                      <span style={{ color: primary, fontSize: "10px", fontWeight: 600, backgroundColor: `${primary}10`, padding: "2px 8px", borderRadius: "10px" }}>{exp.duration}</span>
                    </div>
                    <div style={{ color: "#475569", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>{exp.company}</div>
                    <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155", fontSize: "11px" }}>
                      {exp.bullets.map((bullet, idx) => bullet ? <li key={idx} style={{ marginBottom: "3px" }}>{bullet}</li> : null)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          );
        case "projects":
          return projects.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Projects</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </h2>
              <div style={{ position: "relative", borderLeft: `1.5px solid #cbd5e1`, marginLeft: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
                {projects.map((proj) => (
                  <div key={proj.id} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "-26.5px", top: "4px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: primary, border: "2px solid #ffffff", boxShadow: "0 0 0 1px #cbd5e1" }} />
                    <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>
                      {proj.name}
                    </div>
                    {proj.tech && <div style={{ color: primary, fontSize: "10px", fontWeight: 500, margin: "2px 0" }}>{proj.tech}</div>}
                    <p style={{ margin: "2px 0", color: "#334155", fontSize: "11px" }}>{proj.description}</p>
                    {proj.link && <div style={{ fontSize: "10px", color: primary, marginTop: "2px" }}>🔗 {proj.link}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        case "education":
          return education.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Education</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </h2>
              <div style={{ position: "relative", borderLeft: `1.5px solid #cbd5e1`, marginLeft: "8px", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {education.map((edu) => (
                  <div key={edu.id} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "-26.5px", top: "4px", width: "11px", height: "11px", borderRadius: "50%", backgroundColor: primary, border: "2px solid #ffffff", boxShadow: "0 0 0 1px #cbd5e1" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "12px" }}>{edu.degree} in {edu.field}</div>
                      <span style={{ color: lightText, fontSize: "10px" }}>{edu.year}</span>
                    </div>
                    <div style={{ color: "#475569", fontSize: "11px" }}>{edu.school}</div>
                    {edu.gpa && <div style={{ fontSize: "10px", color: lightText, marginTop: "2px" }}>GPA: {edu.gpa}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        case "skills":
          return (skills.technical.length > 0 || skills.languages.length > 0) && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Skills & Languages</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </h2>
              {skills.technical.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {skills.technical.map((s, idx) => (
                      <span key={idx} style={{ background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 500 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {skills.languages.length > 0 && (
                <div style={{ fontSize: "11px", color: "#475569" }}>
                  <strong>Languages:</strong> {skills.languages.join(", ")}
                </div>
              )}
            </div>
          );
        case "certifications":
          return certifications.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Certifications</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {certifications.map((c, idx) => (
                  <span key={idx} style={{ background: `${primary}08`, color: primary, border: `1px solid ${primary}20`, padding: "3px 8px", borderRadius: "6px", fontSize: "10px", fontWeight: 500 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        case "achievements":
          return achievements.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: 700, color: primary, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Achievements</span>
                <div style={{ flex: 1, height: "1px", backgroundColor: "#e2e8f0" }} />
              </h2>
              <ul style={{ margin: 0, paddingLeft: "16px", color: "#334155", fontSize: "11px" }}>
                {achievements.map((ach, idx) => <li key={idx} style={{ marginBottom: "3px" }}>{ach}</li>)}
              </ul>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div style={{ ...baseContainerStyle, padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: `3px solid ${primary}`, paddingBottom: "20px", marginBottom: "20px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
              {p.fullName || "John Doe"}
            </h1>
            <div style={{ color: primary, fontSize: "13px", fontWeight: 600, marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {experience[0]?.title || "Professional"}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", color: "#475569", fontSize: "10px", textAlign: "right" }}>
            {p.email && <span>{p.email} ✉</span>}
            {p.phone && <span>{p.phone} ✆</span>}
            {p.location && <span>{p.location} ⚲</span>}
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              {p.linkedin && <span style={{ color: primary }}>in/{p.linkedin}</span>}
              {p.github && <span style={{ color: primary }}>git/{p.github}</span>}
            </div>
          </div>
        </div>

        {p.summary && (
          <div style={{ marginBottom: "20px", backgroundColor: `${primary}05`, borderLeft: `4px solid ${primary}`, padding: "12px 16px", borderRadius: "0 8px 8px 0" }}>
            <p style={{ color: "#334155", margin: 0, fontSize: "12px", lineHeight: "1.6" }}>
              {p.summary}
            </p>
          </div>
        )}

        {sectionOrder.map((sec) => (
          <React.Fragment key={sec}>{renderVanguardSection(sec)}</React.Fragment>
        ))}
      </div>
    );
  }

  // ─── GENERAL GENERIC RENDERER FOR OTHER TEMPLATES ───────────────────────────
  // We can write a single elegant renderer that adapts perfectly based on templateId
  const getTemplateThemeStyles = () => {
    switch (templateId) {
      case "solstice":
        return {
          bg: "#fafaf6",
          titleColor: "#1c1917",
          subtitleColor: primary,
          textColor: "#44403c",
          fontFamily: "'Playfair Display', serif",
          headerBorder: "1px solid " + primary,
          secBorder: "1px solid #e7e5e4",
        };
      case "classic":
        return {
          bg: "#ffffff",
          titleColor: "#000000",
          subtitleColor: "#000000",
          textColor: "#111111",
          fontFamily: "'Times New Roman', Times, serif",
          headerBorder: "2px solid #000000",
          secBorder: "1px solid #000000",
        };
      case "modern":
        return {
          bg: "#ffffff",
          titleColor: "#0f172a",
          subtitleColor: primary,
          textColor: "#475569",
          fontFamily: "'Outfit', sans-serif",
          headerBorder: "none",
          secBorder: "2px solid " + primary,
        };
      case "tech":
        return {
          bg: "#0f172a",
          titleColor: "#f8fafc",
          subtitleColor: primary,
          textColor: "#cbd5e1",
          fontFamily: "'Fira Code', 'Courier New', monospace",
          headerBorder: "2px solid " + primary,
          secBorder: "1px solid rgba(99, 102, 241, 0.2)",
        };
      case "executive":
        return {
          bg: "#ffffff",
          titleColor: "#111827",
          subtitleColor: primary,
          textColor: "#374151",
          fontFamily: "'Georgia', serif",
          headerBorder: "1px solid #e5e7eb",
          secBorder: "2px solid " + primary,
        };
      case "vanguard":
        return {
          bg: "#ffffff",
          titleColor: "#0f172a",
          subtitleColor: primary,
          textColor: "#334155",
          fontFamily: "'Outfit', sans-serif",
          headerBorder: `3px solid ${primary}`,
          secBorder: "1px solid #cbd5e1",
        };
      case "atlas":
      default:
        return {
          bg: "#ffffff",
          titleColor: "#1e3a8a",
          subtitleColor: primary,
          textColor: "#334155",
          fontFamily: "'Inter', sans-serif",
          headerBorder: "none",
          secBorder: "2px solid #dbeafe",
        };
    }
  };

  const theme = getTemplateThemeStyles();

  const renderGenericSection = (sec: string) => {
    switch (sec) {
      case "experience":
        return experience.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: templateId === "classic" ? "13px" : "12px", 
              fontWeight: 800, 
              color: theme.subtitleColor, 
              textTransform: "uppercase", 
              letterSpacing: "0.08em", 
              borderBottom: theme.secBorder, 
              paddingBottom: "3px", 
              marginBottom: "10px" 
            }}>
              Experience
            </h2>
            {experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                  <span style={{ color: theme.titleColor }}>{exp.title}</span>
                  <span style={{ color: lightText, fontSize: "11px" }}>{exp.duration}</span>
                </div>
                <div style={{ color: primary, fontSize: "11px", fontWeight: 600, marginBottom: "4px" }}>{exp.company}</div>
                <ul style={{ margin: 0, paddingLeft: "16px", color: theme.textColor }}>
                  {exp.bullets.map((b, idx) => b ? <li key={idx} style={{ marginBottom: "2px" }}>{b}</li> : null)}
                </ul>
              </div>
            ))}
          </div>
        );
      case "projects":
        return projects.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "12px", 
              fontWeight: 800, 
              color: theme.subtitleColor, 
              textTransform: "uppercase", 
              letterSpacing: "0.08em", 
              borderBottom: theme.secBorder, 
              paddingBottom: "3px", 
              marginBottom: "10px" 
            }}>
              Projects
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: 700, color: theme.titleColor }}>
                  {proj.name} {proj.tech && <span style={{ color: lightText, fontWeight: 400, fontSize: "11px" }}>— ({proj.tech})</span>}
                </div>
                <p style={{ margin: "2px 0", color: theme.textColor }}>{proj.description}</p>
                {proj.link && <div style={{ fontSize: "10px", color: primary }}>Link: {proj.link}</div>}
              </div>
            ))}
          </div>
        );
      case "education":
        return education.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "12px", 
              fontWeight: 800, 
              color: theme.subtitleColor, 
              textTransform: "uppercase", 
              letterSpacing: "0.08em", 
              borderBottom: theme.secBorder, 
              paddingBottom: "3px", 
              marginBottom: "10px" 
            }}>
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: 700, color: theme.titleColor }}>{edu.degree} in {edu.field}</div>
                <div style={{ color: theme.textColor, fontSize: "11px" }}>{edu.school} | {edu.year}</div>
                {edu.gpa && <div style={{ fontSize: "10px", color: lightText }}>GPA: {edu.gpa}</div>}
              </div>
            ))}
          </div>
        );
      case "skills":
        return (skills.technical.length > 0 || skills.languages.length > 0) && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "12px", 
              fontWeight: 800, 
              color: theme.subtitleColor, 
              textTransform: "uppercase", 
              letterSpacing: "0.08em", 
              borderBottom: theme.secBorder, 
              paddingBottom: "3px", 
              marginBottom: "10px" 
            }}>
              Skills & Competencies
            </h2>
            {skills.technical.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.technical.map((s, idx) => (
                  <span key={idx} style={{ 
                    backgroundColor: templateId === "tech" ? "rgba(99, 102, 241, 0.1)" : "#ede9fe", 
                    color: templateId === "tech" ? "#a5b4fc" : "#5b21b6", 
                    padding: "3px 8px", 
                    borderRadius: "4px", 
                    fontSize: "10px",
                    fontWeight: 500,
                    border: templateId === "tech" ? "1px solid rgba(99, 102, 241, 0.2)" : "none"
                  }}>{s}</span>
                ))}
              </div>
            )}
            {skills.languages.length > 0 && (
              <div style={{ marginTop: "8px", fontSize: "11px", color: theme.textColor }}>
                <strong>Languages:</strong> {skills.languages.join(", ")}
              </div>
            )}
          </div>
        );
      case "certifications":
        return certifications.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "12px", 
              fontWeight: 800, 
              color: theme.subtitleColor, 
              textTransform: "uppercase", 
              letterSpacing: "0.08em", 
              borderBottom: theme.secBorder, 
              paddingBottom: "3px", 
              marginBottom: "10px" 
            }}>
              Certifications
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {certifications.map((c, idx) => (
                <span key={idx} style={{ 
                  backgroundColor: "#f1f5f9", 
                  color: "#334155", 
                  border: "1px solid #e2e8f0",
                  padding: "3px 8px", 
                  borderRadius: "4px", 
                  fontSize: "10px"
                }}>{c}</span>
              ))}
            </div>
          </div>
        );
      case "achievements":
        return achievements.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ 
              fontSize: "12px", 
              fontWeight: 800, 
              color: theme.subtitleColor, 
              textTransform: "uppercase", 
              letterSpacing: "0.08em", 
              borderBottom: theme.secBorder, 
              paddingBottom: "3px", 
              marginBottom: "10px" 
            }}>
              Key Achievements
            </h2>
            <ul style={{ margin: 0, paddingLeft: "16px", color: theme.textColor }}>
              {achievements.map((ach, idx) => <li key={idx} style={{ marginBottom: "2px" }}>{ach}</li>)}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  // Header & contact rendering depending on template
  const renderHeader = () => {
    if (templateId === "tech") {
      return (
        <div style={{ borderBottom: theme.headerBorder, paddingBottom: "20px", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 700, color: theme.titleColor, margin: "0 0 10px 0" }}>
            <span style={{ color: primary }}>const</span> user = "{p.fullName || "John Doe"}";
          </h1>
          <div style={{ fontSize: "11px", color: "#94a3b8", display: "flex", gap: "15px", flexWrap: "wrap" }}>
            {p.email && <span>email: "{p.email}"</span>}
            {p.phone && <span>phone: "{p.phone}"</span>}
            {p.location && <span>location: "{p.location}"</span>}
            {p.linkedin && <span>linkedin: "{p.linkedin}"</span>}
            {p.github && <span>github: "{p.github}"</span>}
          </div>
        </div>
      );
    }

    if (templateId === "modern") {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "30px" }}>
          <div style={{ width: "70px", height: "70px", borderRadius: "50%", backgroundColor: primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: 800 }}>
            {p.fullName ? p.fullName.split(" ").map(n => n[0]).join("").substring(0, 2) : "JD"}
          </div>
          <div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: theme.titleColor, margin: 0, letterSpacing: "-0.03em" }}>
              {p.fullName || "John Doe"}
            </h1>
            <div style={{ fontSize: "14px", color: primary, fontWeight: 600, marginTop: "2px" }}>
              {experience[0]?.title || "Professional"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px", color: lightText, fontSize: "11px" }}>
              {p.email && <span>{p.email}</span>}
              {p.phone && <span>• {p.phone}</span>}
              {p.location && <span>• {p.location}</span>}
            </div>
          </div>
        </div>
      );
    }

    if (templateId === "solstice") {
      return (
        <div style={{ textAlign: "center", borderTop: theme.headerBorder, borderBottom: theme.headerBorder, padding: "15px 0", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: theme.titleColor, letterSpacing: "0.05em", textTransform: "uppercase", margin: 0 }}>
            {p.fullName || "John Doe"}
          </h1>
          <div style={{ fontSize: "10px", color: lightText, marginTop: "8px", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            {[p.email, p.phone, p.location].filter(Boolean).join("   ·   ")}
          </div>
        </div>
      );
    }

    if (templateId === "executive") {
      return (
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 400, color: theme.titleColor, margin: "0 0 8px 0", letterSpacing: "1px" }}>
            {p.fullName || "John Doe"}
          </h1>
          <div style={{ fontSize: "12px", color: "#4b5563", fontStyle: "italic", display: "flex", justifyContent: "center", gap: "10px" }}>
            {p.email && <span>{p.email}</span>}
            {p.phone && <span>| {p.phone}</span>}
            {p.location && <span>| {p.location}</span>}
            {p.linkedin && <span>| {p.linkedin}</span>}
          </div>
        </div>
      );
    }

    if (templateId === "classic") {
      return (
        <div style={{ textAlign: "center", borderBottom: theme.headerBorder, paddingBottom: "12px", marginBottom: "16px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#000000", margin: "0 0 4px 0", textTransform: "uppercase" }}>
            {p.fullName || "John Doe"}
          </h1>
          <div style={{ fontSize: "12px", color: "#333333" }}>
            {[p.location, p.phone, p.email, p.linkedin].filter(Boolean).join(" • ")}
          </div>
        </div>
      );
    }

    // Default Atlas Header
    return (
      <div style={{ backgroundColor: primary, color: "#ffffff", padding: "30px 40px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: 0, letterSpacing: "-0.01em" }}>
          {p.fullName || "John Doe"}
        </h1>
        <div style={{ fontSize: "13px", color: "#93c5fd", marginTop: "3px", fontWeight: 500 }}>
          {experience[0]?.title || "Professional"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "8px", fontSize: "11px", color: "#bfdbfe" }}>
          {p.email && <span>✉ {p.email}</span>}
          {p.phone && <span>✆ {p.phone}</span>}
          {p.location && <span>⚲ {p.location}</span>}
          {p.linkedin && <span>in {p.linkedin}</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ ...baseContainerStyle, padding: templateId === "atlas" ? "0" : "40px", backgroundColor: theme.bg }}>
      {renderHeader()}
      
      <div style={{ padding: templateId === "atlas" ? "30px 40px" : "0", marginTop: "16px" }}>
        {/* Summary */}
        {p.summary && (
          <div style={{ 
            marginBottom: "20px", 
            borderLeft: templateId === "atlas" ? `4px solid ${primary}` : "none",
            paddingLeft: templateId === "atlas" ? "14px" : "0",
            backgroundColor: templateId === "atlas" ? "#f0f6ff" : "transparent"
          }}>
            {templateId === "executive" && (
              <h2 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", color: "#6b7280", margin: "0 0 10px 0", textAlign: "center" }}>Executive Profile</h2>
            )}
            <p style={{ color: theme.textColor, margin: 0, fontSize: "12px", lineHeight: "1.6", fontStyle: templateId === "solstice" ? "italic" : "normal" }}>
              {p.summary}
            </p>
          </div>
        )}

        {/* Dynamic Sorted Sections */}
        {sectionOrder.map((sec) => (
          <React.Fragment key={sec}>{renderGenericSection(sec)}</React.Fragment>
        ))}
      </div>
    </div>
  );
}
