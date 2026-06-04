import { NextResponse } from "next/server";
import { getResumeById, updateResume, deleteResume, duplicateResume } from "@/lib/storage";

// GET /api/resumes/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const resume = await getResumeById(id);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ resume });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch resume" }, { status: 500 });
  }
}

// PUT /api/resumes/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { title, templateId, themeConfig, data, templateType, userType, resumeScore, analysis, resumeDNA, skillGap } = body;

    const extraProps = { templateType, userType, resumeScore, analysis, resumeDNA, skillGap };
    const updated = await updateResume(id, title, templateId, themeConfig, data, extraProps);
    if (!updated) {
      return NextResponse.json({ error: "Resume not found or could not be updated" }, { status: 404 });
    }
    return NextResponse.json({ resume: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update resume" }, { status: 500 });
  }
}

// DELETE /api/resumes/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await deleteResume(id);
    if (!success) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Resume deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete resume" }, { status: 500 });
  }
}

// POST /api/resumes/[id] (Duplication endpoint)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const duplicated = await duplicateResume(id);
    if (!duplicated) {
      return NextResponse.json({ error: "Resume not found or could not be duplicated" }, { status: 404 });
    }
    return NextResponse.json({ resume: duplicated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to duplicate resume" }, { status: 500 });
  }
}
