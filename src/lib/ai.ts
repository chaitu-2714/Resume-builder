// AI Layer for Smart Resume Builder
// Supports OpenAI, Anthropic, or Local Mock fallbacks

export interface JobMatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface InterviewQuestion {
  question: string;
  type: "Technical" | "HR" | "Behavioral";
  reason: string;
  approach: string;
}

export interface ResumeRoastResult {
  score: number;
  roast: string;
  improvements: string[];
}

// Helper to call OpenAI API
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key missing");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// Helper to call Anthropic API
async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Anthropic API key missing");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.content?.map((b: { text?: string }) => b.text || "").join("") || "";
}

// Wrapper to route to active service or fall back to mock
export async function callAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callAnthropic(systemPrompt, userPrompt);
    } catch (e) {
      console.warn("Anthropic API failed, attempting OpenAI fallback...", e);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(systemPrompt, userPrompt);
    } catch (e) {
      console.warn("OpenAI API failed.", e);
    }
  }

  // Fallback indicator
  throw new Error("NO_CLOUD_KEYS");
}

// ─── LOCAL MOCK ENGINES (Offline/Local Development) ───────────

export async function generateSummary(
  fullName: string,
  title: string,
  company: string,
  skills: string[],
  existingSummary: string
): Promise<string> {
  try {
    const prompt = `Name: ${fullName}\nRole: ${title} @ ${company}\nSkills: ${skills.join(", ")}\nExisting: ${existingSummary}`;
    const result = await callAI(
      "You are an expert resume writer. Write a compelling 2-3 sentence professional summary. Be specific, impactful, and ATS-friendly. Return only the summary text, no quotes.",
      prompt
    );
    return result.trim();
  } catch (error) {
    // Return smart mocked response
    const jobTitle = title || "Software Professional";
    const companyStr = company ? ` at ${company}` : "";
    const skillsList = skills.length > 0 ? skills.slice(0, 4).join(", ") : "cutting-edge technologies";
    return `Results-driven ${jobTitle}${companyStr} with a proven track record of designing, building, and deploying robust software systems. Adept in leveraging ${skillsList} to solve complex engineering challenges, optimize system architectures, and deliver high-value products. Passionate about driving engineering excellence and collaborating across cross-functional teams to meet corporate objectives.`;
  }
}

export async function generateBullets(
  title: string,
  company: string,
  duration: string,
  existingBullets: string[]
): Promise<string[]> {
  try {
    const prompt = `Job title: ${title}\nCompany: ${company}\nDuration: ${duration}\nExisting: ${existingBullets.join(", ")}`;
    const result = await callAI(
      "You are an expert resume writer. Generate exactly 3 strong, quantified bullet points for a resume experience entry. Each bullet should start with a strong action verb and contain metrics. Return ONLY a JSON array of 3 strings, nothing else.",
      prompt
    );
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    // Mock bullets based on job title
    const jobTitle = (title || "Software Engineer").toLowerCase();
    if (jobTitle.includes("frontend") || jobTitle.includes("react") || jobTitle.includes("ui")) {
      return [
        "Architected and implemented responsive user interfaces using React and Next.js, resulting in a 35% increase in mobile engagement and web performance score of 95+.",
        "Collaborated with UX/UI designers to develop a reusable component library with Tailwind CSS, reducing front-end development cycle time by 25%.",
        "Optimized client-side rendering, asset loading, and bundle splits, slashing homepage load times by 1.2s and improving SEO indexing speed."
      ];
    } else if (jobTitle.includes("backend") || jobTitle.includes("node") || jobTitle.includes("api") || jobTitle.includes("database")) {
      return [
        "Designed and maintained scalable RESTful and GraphQL APIs using Node.js, supporting 50k+ daily active users with 99.9% uptime.",
        "Refactored relational database queries and implemented Redis caching layer, reducing API latency by 45% and optimizing memory utilization.",
        "Configured secure token-based user authentication and microservice routing workflows, mitigating security vulnerabilities and security audit issues."
      ];
    } else {
      return [
        `Led execution and deployment of scalable software systems as a ${title || "Engineer"}, contributing to a 20% increase in team development velocity.`,
        "Implemented rigorous automated unit and integration testing workflows, bringing test coverage to 92% and reducing production bugs by 30%.",
        "Streamlined CI/CD deployment pipelines on AWS/Vercel, cutting build-to-deploy release cycles from 45 minutes to less than 8 minutes."
      ];
    }
  }
}

export async function matchJob(resumeData: any, jobDesc: string): Promise<JobMatchResult> {
  try {
    const prompt = `RESUME:\n${JSON.stringify(resumeData)}\n\nJOB DESCRIPTION:\n${jobDesc}`;
    const result = await callAI(
      "You are an ATS expert. Analyze resume vs job description. Return ONLY valid JSON with keys: score (number 0-100), matchedKeywords (array of strings), missingKeywords (array of strings), suggestions (array of strings, max 3).",
      prompt
    );
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    // Intelligent heuristic matcher based on skills overlap
    const jdText = jobDesc.toLowerCase();
    const skills = resumeData.skills?.technical || resumeData.skills || [];
    
    // Find matched and missing keywords
    const commonKeywords = [
      "react", "next.js", "typescript", "javascript", "tailwind", "node.js", "express", 
      "postgresql", "prisma", "mongodb", "graphql", "aws", "docker", "ci/cd", "redis",
      "git", "agile", "scrum", "testing", "jest", "rest api", "system design"
    ];
    
    const matched: string[] = [];
    const missing: string[] = [];
    
    commonKeywords.forEach(keyword => {
      if (jdText.includes(keyword)) {
        const hasSkill = skills.some((s: string) => s.toLowerCase().includes(keyword));
        if (hasSkill) {
          matched.push(keyword.toUpperCase());
        } else {
          missing.push(keyword.toUpperCase());
        }
      }
    });

    if (missing.length === 0 && matched.length === 0) {
      // Default fallback keywords if job desc is small
      missing.push("TYPESCRIPT", "SYSTEM DESIGN", "CI/CD");
      matched.push("REACT", "JAVASCRIPT");
    }

    const matchedCount = matched.length;
    const totalKeywords = matchedCount + missing.length;
    const ratio = totalKeywords > 0 ? matchedCount / totalKeywords : 0.6;
    const score = Math.round(50 + ratio * 45); // Score between 50 and 95

    return {
      score,
      matchedKeywords: matched.slice(0, 6),
      missingKeywords: missing.slice(0, 6),
      suggestions: [
        missing.length > 0 
          ? `Incorporate missing keywords like ${missing.slice(0, 3).join(", ")} directly into your experience or skills section.`
          : "Your technical keywords match the job description very well.",
        "Add quantitative metrics (e.g. percentages, money saved, hours reduced) to your experience bullet points.",
        "Tailor your Professional Summary to explicitly mention the industry domain of this position."
      ]
    };
  }
}

export async function generateInterviewQuestions(resumeData: any, jobDesc: string): Promise<InterviewQuestion[]> {
  try {
    const prompt = `Resume: ${JSON.stringify(resumeData)}\nJob: ${jobDesc || "General role"}`;
    const result = await callAI(
      "You are an interview coach. Generate interview questions based on this resume. Return ONLY valid JSON: an array of objects with keys: question, type (HR/Technical/Behavioral), reason, approach.",
      prompt
    );
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    const experience = resumeData.experience || [];
    const recentCompany = experience[0]?.company || "your last role";
    const recentTitle = experience[0]?.title || "Software Professional";
    
    return [
      {
        question: `Tell me about a challenging project you built using ${resumeData.skills?.technical?.[0] || "your technical skills"}. What was the outcome?`,
        type: "Technical",
        reason: "Interviewer wants to test real-world application of your stated technologies.",
        approach: "Use the STAR method: Situation, Task, Action (emphasizing technical decisions), and Result (quantifiable achievement)."
      },
      {
        question: `You spent time at ${recentCompany} as a ${recentTitle}. Can you describe a conflict you had with a team member or stakeholder and how you resolved it?`,
        type: "Behavioral",
        reason: "Assesses collaboration, emotional intelligence, and professional communication skills.",
        approach: "Describe a minor professional disagreement, explain how you actively listened, compromised, and arrived at a win-win result."
      },
      {
        question: "Why do you want to join our company, and why do you think you are the right fit for this role?",
        type: "HR",
        reason: "Evaluates candidate motivation, alignment with corporate culture, and understanding of the job description.",
        approach: "Express enthusiasm for the product/industry, link your key strengths directly to the main responsibilities of the job description."
      }
    ];
  }
}

export async function generateCoverLetter(resumeData: any, jobDesc: string): Promise<string> {
  try {
    const prompt = `Resume: ${JSON.stringify(resumeData)}\nJob Description: ${jobDesc || "General application"}`;
    const result = await callAI(
      "Write a professional, engaging cover letter tailored to the job description using proper business format. Return only the letter text.",
      prompt
    );
    return result.trim();
  } catch (error) {
    const p = resumeData.personalInfo || {};
    const name = p.fullName || "[Your Name]";
    const email = p.email || "[Your Email]";
    const phone = p.phone || "[Your Phone]";
    const location = p.location || "[Your Location]";
    const title = resumeData.experience?.[0]?.title || "Software Professional";

    return `Dear Hiring Manager,

I am writing to express my strong interest in the open position at your company. With a solid foundation in software development and hands-on experience as a ${title}, I am confident in my ability to make an immediate, positive contribution to your engineering team.

Throughout my career, I have focused on building performant, scalable applications and streamlining development workflows. My technical expertise spans ${resumeData.skills?.technical?.slice(0, 5).join(", ") || "full-stack technologies"}, allowing me to design user-friendly products and deploy highly optimized database layers.

I am particularly drawn to this opportunity because of your team's dedication to engineering innovation. I look forward to bringing my problem-solving mindset, collaboration skills, and technical drive to your organization.

Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications in greater detail.

Sincerely,

${name}
${email} | ${phone}
${location}`;
  }
}

export async function roastResume(resumeData: any): Promise<ResumeRoastResult> {
  try {
    const prompt = `Resume JSON:\n${JSON.stringify(resumeData)}`;
    const result = await callAI(
      "You are a brutally honest recruiter. Review this resume. Return ONLY valid JSON with keys: score (number 0-100), roast (string - funny, sharp critique), improvements (array of strings - actionable recommendations).",
      prompt
    );
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    const p = resumeData.personalInfo || {};
    const expCount = resumeData.experience?.length || 0;
    const skillCount = resumeData.skills?.technical?.length || 0;

    let score = 75;
    let roast = "Honestly? It is clean but a bit generic. It looks like a standard template off the shelf. Where is the personality, and more importantly, where are the results? Show, don't just tell me you did the job.";
    const improvements = [
      "Your bullet points are a list of duties. Rewrite them to focus on outcomes (e.g. 'Increased sales by 15%').",
      "Add direct links to your GitHub or portfolio to show recruiters your actual work."
    ];

    if (expCount === 0) {
      score -= 20;
      roast = "A resume without work experience is like a car without wheels—looks okay sitting there, but going absolutely nowhere. Add internships, open-source contributions, or school projects ASAP.";
      improvements.push("Create a dedicated projects section to highlight your hands-on building experience.");
    }
    if (skillCount < 4) {
      score -= 10;
      roast += " Also, listing only a couple of skills makes me wonder if you just learned to code yesterday. Bulk it up!";
      improvements.push("Expand your skills section with libraries, frameworks, tools, and methodologies you've worked with.");
    }

    return {
      score,
      roast,
      improvements
    };
  }
}

export interface ResumeAnalysisResult {
  score: number;
  analysis: {
    missingSkills: string[];
    weakSections: string[];
    keywordOptimization: string[];
    suggestions: string[];
    improvementTips: string[];
  };
  resumeDNA: {
    leadership: number;
    technicalDepth: number;
    collaboration: number;
  };
  skillGap: {
    identifiedGaps: string[];
    actionableFeedback: string;
  };
}

export async function analyzeResume(resumeData: any, userType: string): Promise<ResumeAnalysisResult> {
  try {
    const prompt = `RESUME DATA:\n${JSON.stringify(resumeData)}\n\nUSER TYPE:\n${userType}`;
    const result = await callAI(
      "You are an expert resume analyst and recruiter. Perform a deep analysis of the resume based on the selected user type (Student, Fresher, Experienced, Switcher). Evaluate the ATS score (0-100), identify missing skills, list weak sections, suggest keyword optimizations, provide general suggestions, offer improvement tips, evaluate leadership/technicalDepth/collaboration on a scale of 0-100 for Resume DNA, and identify skill gaps with actionable feedback. Return ONLY valid JSON matching this structure: { \"score\": number, \"analysis\": { \"missingSkills\": string[], \"weakSections\": string[], \"keywordOptimization\": string[], \"suggestions\": string[], \"improvementTips\": string[] }, \"resumeDNA\": { \"leadership\": number, \"technicalDepth\": number, \"collaboration\": number }, \"skillGap\": { \"identifiedGaps\": string[], \"actionableFeedback\": string } }",
      prompt
    );
    const clean = result.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (error) {
    const skills = resumeData.skills?.technical || [];
    const experience = resumeData.experience || [];
    const projects = resumeData.projects || [];
    const education = resumeData.education || [];

    let score = 65;
    if (skills.length > 5) score += 10;
    if (experience.length > 0) score += 10;
    if (projects.length > 0) score += 10;
    if (education.length > 0) score += 5;
    score = Math.min(score, 98);

    let leadership = 50;
    let technicalDepth = 60;
    let collaboration = 55;

    let missingSkills = ["System Design", "Cloud Deployment", "Automated Testing"];
    let weakSections: string[] = [];
    let keywordOptimization = ["KPIs", "Metrics", "Scale"];
    let suggestions = [
      "Incorporate more quantifiable achievements using the STAR methodology.",
      "Add direct links to your project repositories to verify code quality."
    ];
    let improvementTips = [
      "Quantify your experience bullets with metrics like % improvement, hours saved, or revenue generated.",
      "Format dates and section headers consistently for cleaner visual parsing."
    ];
    let identifiedGaps = ["Docker", "CI/CD Pipelines", "System Architecture"];
    let actionableFeedback = "";

    const type = (userType || "").toLowerCase();
    if (type === "student") {
      leadership = 40;
      technicalDepth = 55;
      collaboration = 60;
      missingSkills = ["Production Experience", "CI/CD Tools", "Agile Methodologies"];
      weakSections = experience.length === 0 ? ["Professional Experience"] : [];
      identifiedGaps = ["Industry-grade deployment", "Version control workflows", "Testing practices"];
      actionableFeedback = "As a student, focus on building and deploying 2-3 robust full-stack projects. Host them live and add verification links. Highlight university leadership roles or group project coordination to build your collaboration metrics.";
    } else if (type === "fresher") {
      leadership = 35;
      technicalDepth = 65;
      collaboration = 55;
      missingSkills = ["System Design", "Microservices", "Cloud Platforms (AWS/GCP)"];
      weakSections = experience.length === 0 ? ["Internships/Experience"] : [];
      identifiedGaps = ["Architecture principles", "Advanced database indexing", "API optimization"];
      actionableFeedback = "For a fresher, emphasize projects and technical skills. Add internship details if any. If not, build personal projects that demonstrate an understanding of database optimization, API creation, and clean code principles.";
    } else if (type === "experienced" || type === "experienced professional") {
      leadership = 75;
      technicalDepth = 80;
      collaboration = 70;
      missingSkills = ["Technical Leadership", "System Design", "Budgeting/Resource Planning"];
      weakSections = projects.length > 0 && experience.length < 2 ? ["Career Progression"] : [];
      identifiedGaps = ["Team Mentorship", "System Design Patterns", "Strategic Planning"];
      actionableFeedback = "As an experienced professional, shift focus from daily tasks to strategic leadership and business outcomes. Highlight how you mentored junior developers, led design decisions, and directly saved costs or boosted performance metrics.";
    } else if (type === "switcher" || type === "career switcher") {
      leadership = 60;
      technicalDepth = 45;
      collaboration = 65;
      missingSkills = ["Software Engineering fundamentals", "Core technical stack expertise"];
      weakSections = ["Technical Experience"];
      identifiedGaps = ["Hands-on coding experience", "Software delivery cycle understanding"];
      actionableFeedback = "For a career switcher, highlight transferable skills (project management, domain knowledge, problem-solving). Build 1-2 major projects in your target tech stack to prove your coding capability, and link them prominently.";
    }

    return {
      score,
      analysis: {
        missingSkills,
        weakSections,
        keywordOptimization,
        suggestions,
        improvementTips
      },
      resumeDNA: {
        leadership,
        technicalDepth,
        collaboration
      },
      skillGap: {
        identifiedGaps,
        actionableFeedback
      }
    };
  }
}

export async function enhanceDescription(text: string, userType: string | null): Promise<string> {
  try {
    const prompt = `Text to enhance: "${text}"\nUser Type: ${userType || "General Professional"}`;
    const result = await callAI(
      "You are an expert resume writer. Enhance the user's input text to be professional, ATS-friendly, and start with or use strong action verbs. Keep the tone professional. IMPORTANT: Do not invent any new facts, metrics, technologies, or achievements not present in the input. Return ONLY the enhanced text, nothing else.",
      prompt
    );
    return result.trim();
  } catch (error) {
    let cleaned = text.trim();
    if (!cleaned) return "Developed and implemented core solutions to meet business requirements.";
    if (cleaned.toLowerCase().startsWith("worked on")) {
      cleaned = cleaned.replace(/^worked on/i, "Architected and engineered");
    } else if (cleaned.toLowerCase().startsWith("helped with")) {
      cleaned = cleaned.replace(/^helped with/i, "Collaborated on and facilitated");
    } else if (cleaned.toLowerCase().startsWith("responsible for")) {
      cleaned = cleaned.replace(/^responsible for/i, "Spearheaded");
    } else {
      cleaned = "Optimized and spearheaded: " + cleaned;
    }
    return cleaned;
  }
}
