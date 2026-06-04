import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { ResumeData } from "./store";

// ─── DOCX EXPORTER ─────────────────────────────────────────────
export async function generateDocx(resume: ResumeData): Promise<Buffer> {
  const p = resume.personalInfo;
  
  // Create sections array
  const children: any[] = [];

  // Header Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: p.fullName || "Your Name",
          bold: true,
          size: 32, // 16pt
        }),
      ],
    })
  );

  // Contact Info Line
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.github].filter(Boolean);
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: contactParts.join("  |  "),
          size: 18, // 9pt
        }),
      ],
    })
  );

  // Professional Summary
  if (p.summary) {
    children.push(
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
      }),
      new Paragraph({
        text: p.summary,
        spacing: { after: 200 },
      })
    );
  }

  // Experience Section
  if (resume.experience.length > 0) {
    children.push(
      new Paragraph({
        text: "WORK EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
      })
    );

    resume.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({ text: exp.title, bold: true }),
            new TextRun({ text: ` — ${exp.company}`, italics: true }),
            new TextRun({ text: `\t${exp.duration}`, bold: true }), // tabs for right alignment
          ],
        })
      );

      exp.bullets.forEach((bullet) => {
        if (bullet.trim()) {
          children.push(
            new Paragraph({
              text: `• ${bullet}`,
              spacing: { after: 40 },
              indent: { left: 360 }, // indent bullet points
            })
          );
        }
      });
    });
  }

  // Education Section
  if (resume.education.length > 0) {
    children.push(
      new Paragraph({
        text: "EDUCATION",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
      })
    );

    resume.education.forEach((edu) => {
      children.push(
        new Paragraph({
          spacing: { before: 80, after: 50 },
          children: [
            new TextRun({ text: `${edu.degree} in ${edu.field}`, bold: true }),
            new TextRun({ text: `, ${edu.school}` }),
            new TextRun({ text: `\t${edu.year}`, bold: true }),
          ],
        })
      );
    });
  }

  // Skills Section
  const techSkills = resume.skills?.technical || [];
  const softSkills = resume.skills?.soft || [];
  
  if (techSkills.length > 0 || softSkills.length > 0) {
    children.push(
      new Paragraph({
        text: "SKILLS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
      })
    );

    if (techSkills.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Technical Skills: ", bold: true }),
            new TextRun({ text: techSkills.join(", ") }),
          ],
          spacing: { after: 50 },
        })
      );
    }

    if (softSkills.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Soft Skills: ", bold: true }),
            new TextRun({ text: softSkills.join(", ") }),
          ],
          spacing: { after: 100 },
        })
      );
    }
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    children.push(
      new Paragraph({
        text: "CERTIFICATIONS",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 150, after: 100 },
      }),
      new Paragraph({
        text: resume.certifications.join(", "),
        spacing: { after: 100 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBuffer(doc);
  return blob;
}

// ─── PDF EXPORTER ──────────────────────────────────────────────
export async function generatePdf(resume: ResumeData, templateId: string): Promise<Buffer> {
  // To avoid Node rendering errors with dynamic imports and canvas requirements,
  // we will import react-pdf on demand
  try {
    const { renderToBuffer } = await import("@react-pdf/renderer");
    const React = await import("react");
    
    // Simple PDF-compatible document tree using react-pdf components
    // We will dynamically render it here
    const { Document: PdfDoc, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");
    
    const styles = StyleSheet.create({
      page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
      header: { borderBottomWidth: 2, borderBottomColor: "#6366f1", paddingBottom: 10, marginBottom: 15 },
      title: { fontSize: 20, fontWeight: "bold" },
      subtitle: { fontSize: 9, color: "#4b5563", marginTop: 4 },
      sectionTitle: { fontSize: 12, fontWeight: "bold", color: "#6366f1", marginTop: 15, borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingBottom: 2 },
      itemTitle: { fontSize: 10, fontWeight: "bold", marginTop: 8 },
      itemDuration: { fontSize: 9, color: "#6b7280" },
      itemDesc: { fontSize: 9, color: "#374151", marginTop: 2, paddingLeft: 8 },
      row: { flexDirection: "row", justifyContent: "space-between" },
    });

    const p = resume.personalInfo;

    const MyDoc = React.createElement(
      PdfDoc,
      null,
      React.createElement(
        Page,
        { size: "A4", style: styles.page },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.title }, p.fullName || "Your Name"),
          React.createElement(Text, { style: styles.subtitle }, [p.email, p.phone, p.location].filter(Boolean).join("  •  "))
        ),
        p.summary ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.sectionTitle }, "SUMMARY"),
          React.createElement(Text, { style: { marginTop: 4, lineHeight: 1.4 } }, p.summary)
        ) : null,
        resume.experience.length > 0 ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.sectionTitle }, "EXPERIENCE"),
          resume.experience.map((exp, i) =>
            React.createElement(
              View,
              { key: exp.id || i },
              React.createElement(
                View,
                { style: [styles.row, { marginTop: 6 }] },
                React.createElement(Text, { style: styles.itemTitle }, `${exp.title} - ${exp.company}`),
                React.createElement(Text, { style: styles.itemDuration }, exp.duration)
              ),
              exp.bullets.map((b, idx) =>
                b ? React.createElement(Text, { key: idx, style: styles.itemDesc }, `• ${b}`) : null
              )
            )
          )
        ) : null,
        resume.education.length > 0 ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.sectionTitle }, "EDUCATION"),
          resume.education.map((edu, i) =>
            React.createElement(
              View,
              { key: edu.id || i, style: [styles.row, { marginTop: 6 }] },
              React.createElement(Text, { style: styles.itemTitle }, `${edu.degree} in ${edu.field} - ${edu.school}`),
              React.createElement(Text, { style: styles.itemDuration }, edu.year)
            )
          )
        ) : null,
        resume.skills?.technical?.length > 0 ? React.createElement(
          View,
          null,
          React.createElement(Text, { style: styles.sectionTitle }, "SKILLS"),
          React.createElement(
            Text,
            { style: { marginTop: 4 } },
            `Technical: ${resume.skills.technical.join(", ")}`
          )
        ) : null
      )
    );

    const buffer = await renderToBuffer(MyDoc);
    return buffer;
  } catch (error) {
    console.error("react-pdf rendering failed, returning simple txt format", error);
    // Simple text fallback
    return Buffer.from(JSON.stringify(resume, null, 2));
  }
}
