import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getResumes, createResume } from "@/lib/storage";

// GET /api/resumes
export async function GET() {
  try {
    const userId = await getAuthUserId();
    const list = await getResumes(userId);
    return NextResponse.json({ resumes: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch resumes" }, { status: 500 });
  }
}

// POST /api/resumes
export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    const body = await req.json().catch(() => ({}));
    const { title, templateId, themeConfig, data } = body;
    
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newResume = await createResume(userId, title, templateId, themeConfig, data);
    return NextResponse.json({ resume: newResume }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create resume" }, { status: 500 });
  }
}
