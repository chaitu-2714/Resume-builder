import { NextResponse } from "next/server";
import {
  generateSummary,
  generateBullets,
  matchJob,
  generateInterviewQuestions,
  generateCoverLetter,
  roastResume,
  enhanceDescription,
  analyzeResume,
} from "@/lib/ai";

// POST /api/ai
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { task } = body;

    if (!task) {
      return NextResponse.json({ error: "Task parameter is required" }, { status: 400 });
    }

    switch (task) {
      case "summary": {
        const { fullName, title, company, skills, existingSummary } = body;
        const summary = await generateSummary(fullName || "", title || "", company || "", skills || [], existingSummary || "");
        return NextResponse.json({ summary });
      }

      case "bullets": {
        const { title, company, duration, existingBullets } = body;
        const bullets = await generateBullets(title || "", company || "", duration || "", existingBullets || []);
        return NextResponse.json({ bullets });
      }

      case "match": {
        const { resumeData, jobDesc } = body;
        if (!resumeData || !jobDesc) {
          return NextResponse.json({ error: "Resume data and job description are required" }, { status: 400 });
        }
        const matchResult = await matchJob(resumeData, jobDesc);
        return NextResponse.json(matchResult);
      }

      case "interview": {
        const { resumeData, jobDesc } = body;
        if (!resumeData) {
          return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
        }
        const questions = await generateInterviewQuestions(resumeData, jobDesc || "");
        return NextResponse.json({ questions });
      }

      case "cover-letter": {
        const { resumeData, jobDesc } = body;
        if (!resumeData) {
          return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
        }
        const coverLetter = await generateCoverLetter(resumeData, jobDesc || "");
        return NextResponse.json({ coverLetter });
      }

      case "roast": {
        const { resumeData } = body;
        if (!resumeData) {
          return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
        }
        const roastResult = await roastResume(resumeData);
        return NextResponse.json(roastResult);
      }

      case "enhance_description": {
        const { text, userType } = body;
        if (!text) {
          return NextResponse.json({ error: "Text is required" }, { status: 400 });
        }
        const enhancedText = await enhanceDescription(text, userType || null);
        return NextResponse.json({ enhancedText });
      }

      case "analyze": {
        const { resumeData, userType } = body;
        if (!resumeData || !userType) {
          return NextResponse.json({ error: "Resume data and user type are required" }, { status: 400 });
        }
        const analysisResult = await analyzeResume(resumeData, userType);
        return NextResponse.json(analysisResult);
      }

      default:
        return NextResponse.json({ error: `Unknown AI task: ${task}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json({ error: error.message || "AI processing failed" }, { status: 500 });
  }
}
