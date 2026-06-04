import { NextResponse } from "next/server";
import { getResumeById } from "@/lib/storage";
import { generateDocx, generatePdf } from "@/lib/export";

// POST /api/export
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resumeId, format } = body;

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 });
    }

    const resume = await getResumeById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (format === "docx") {
      const buffer = await generateDocx(resume.data);
      const title = resume.title || "Resume";
      const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "_") + ".docx";
      
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    } else {
      // Default to PDF
      const buffer = await generatePdf(resume.data, resume.templateId || "nova");
      const title = resume.title || "Resume";
      const filename = title.toLowerCase().replace(/[^a-z0-9]+/g, "_") + ".pdf";
      
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }
  } catch (error: any) {
    console.error("Export endpoint error:", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 500 });
  }
}
