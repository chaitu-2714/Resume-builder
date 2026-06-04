import fs from "fs";
import path from "path";
import { prisma, checkDbConnection } from "./db";
import { ResumeData, ThemeConfig } from "./store";

const MOCK_DB_PATH = process.env.VERCEL
  ? path.join("/tmp", "resumes-db.json")
  : path.join(process.cwd(), "resumes-db.json");

export interface StoredResume {
  id: string;
  title: string;
  userId: string;
  templateId: string;
  templateType?: string;
  userType?: string | null;
  resumeScore?: number | null;
  analysis?: any;
  resumeDNA?: any;
  skillGap?: any;
  themeConfig: ThemeConfig;
  data: ResumeData;
  versionHistory: Array<{ timestamp: string; data: ResumeData }>;
  createdAt: string;
  updatedAt: string;
}

// Ensure the local JSON file exists
function ensureLocalDb() {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify({ resumes: [], users: [] }, null, 2));
  }
}

// Read local JSON db
function readLocalDb(): { resumes: StoredResume[] } {
  ensureLocalDb();
  try {
    const raw = fs.readFileSync(MOCK_DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { resumes: [] };
  }
}

// Write local JSON db
function writeLocalDb(data: { resumes: StoredResume[] }) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(data, null, 2));
}

// ─── HIGH-LEVEL RESUME ACTIONS ─────────────────────────────────

export async function getResumes(userId: string): Promise<any[]> {
  const isDbActive = await checkDbConnection();
  
  if (isDbActive) {
    try {
      return await prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      });
    } catch (e) {
      console.warn("Prisma getResumes failed, falling back to local storage.", e);
    }
  }

  // Local storage fallback
  const db = readLocalDb();
  return db.resumes
    .filter((r) => r.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getResumeById(id: string): Promise<any | null> {
  const isDbActive = await checkDbConnection();

  if (isDbActive) {
    try {
      return await prisma.resume.findUnique({
        where: { id },
      });
    } catch (e) {
      console.warn("Prisma getResumeById failed, falling back to local storage.", e);
    }
  }

  // Local storage fallback
  const db = readLocalDb();
  const found = db.resumes.find((r) => r.id === id);
  return found || null;
}

export async function createResume(
  userId: string,
  title: string,
  templateId: string = "nova",
  themeConfig?: ThemeConfig,
  data?: ResumeData
): Promise<any> {
  const defaultData: ResumeData = {
    personalInfo: { fullName: "", email: "", phone: "", location: "", website: "", linkedin: "", github: "", summary: "" },
    education: [],
    skills: { technical: [], soft: [], languages: [] },
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
  };

  const defaultTheme: ThemeConfig = {
    primaryColor: "#0f172a",
    accentColor: "#6366f1",
    fontFamily: "Inter",
    fontSize: "12px",
    lineHeight: "1.4",
  };

  const id = Math.random().toString(36).slice(2, 9) + "-" + Math.random().toString(36).slice(2, 9);
  const now = new Date().toISOString();
  
  const resumePayload = {
    id,
    title,
    userId,
    templateId,
    templateType: "modern",
    userType: null,
    resumeScore: null,
    analysis: null,
    resumeDNA: null,
    skillGap: null,
    themeConfig: themeConfig || defaultTheme,
    data: data || defaultData,
    versionHistory: [],
    createdAt: now,
    updatedAt: now,
  };

  const isDbActive = await checkDbConnection();
  if (isDbActive) {
    try {
      // Upsert User first to avoid foreign key violations in Clerk setups
      await prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: { id: userId, email: `${userId}@mock.com`, name: "Local User" },
      });

      return await prisma.resume.create({
        data: {
          id,
          title,
          userId,
          templateId,
          templateType: "modern",
          themeConfig: themeConfig as any || defaultTheme,
          data: data as any || defaultData,
          versionHistory: [] as any,
        },
      });
    } catch (e) {
      console.warn("Prisma createResume failed, falling back to local storage.", e);
    }
  }

  // Local storage fallback
  const db = readLocalDb();
  db.resumes.push(resumePayload);
  writeLocalDb(db);
  return resumePayload;
}

export async function updateResume(
  id: string,
  title?: string,
  templateId?: string,
  themeConfig?: ThemeConfig,
  data?: ResumeData,
  extraProps?: any
): Promise<any | null> {
  const now = new Date().toISOString();
  const isDbActive = await checkDbConnection();

  if (isDbActive) {
    try {
      // Fetch current for version history
      const current = await prisma.resume.findUnique({ where: { id } });
      let updatedHistory = current?.versionHistory ? JSON.parse(JSON.stringify(current.versionHistory)) : [];
      if (!Array.isArray(updatedHistory)) updatedHistory = [];

      if (data && current?.data) {
        // Limit history to 5 versions
        updatedHistory.push({ timestamp: now, data: current.data });
        if (updatedHistory.length > 5) {
          updatedHistory.shift();
        }
      }

      return await prisma.resume.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(templateId !== undefined && { templateId }),
          ...(extraProps?.templateType !== undefined && { templateType: extraProps.templateType }),
          ...(extraProps?.userType !== undefined && { userType: extraProps.userType }),
          ...(extraProps?.resumeScore !== undefined && { resumeScore: extraProps.resumeScore }),
          ...(extraProps?.analysis !== undefined && { analysis: extraProps.analysis as any }),
          ...(extraProps?.resumeDNA !== undefined && { resumeDNA: extraProps.resumeDNA as any }),
          ...(extraProps?.skillGap !== undefined && { skillGap: extraProps.skillGap as any }),
          ...(themeConfig !== undefined && { themeConfig: themeConfig as any }),
          ...(data !== undefined && { data: data as any }),
          versionHistory: updatedHistory as any,
        },
      });
    } catch (e) {
      console.warn("Prisma updateResume failed, falling back to local storage.", e);
    }
  }

  // Local storage fallback
  const db = readLocalDb();
  const idx = db.resumes.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const current = db.resumes[idx];
  let updatedHistory = current.versionHistory || [];
  if (data) {
    updatedHistory.push({ timestamp: now, data: JSON.parse(JSON.stringify(current.data)) });
    if (updatedHistory.length > 5) {
      updatedHistory.shift();
    }
  }

  const updated: StoredResume = {
    ...current,
    ...(title !== undefined && { title }),
    ...(templateId !== undefined && { templateId }),
    ...(themeConfig !== undefined && { themeConfig }),
    ...(data !== undefined && { data }),
    ...(extraProps?.templateType !== undefined && { templateType: extraProps.templateType }),
    ...(extraProps?.userType !== undefined && { userType: extraProps.userType }),
    ...(extraProps?.resumeScore !== undefined && { resumeScore: extraProps.resumeScore }),
    ...(extraProps?.analysis !== undefined && { analysis: extraProps.analysis }),
    ...(extraProps?.resumeDNA !== undefined && { resumeDNA: extraProps.resumeDNA }),
    ...(extraProps?.skillGap !== undefined && { skillGap: extraProps.skillGap }),
    versionHistory: updatedHistory,
    updatedAt: now,
  };

  db.resumes[idx] = updated;
  writeLocalDb(db);
  return updated;
}

export async function deleteResume(id: string): Promise<boolean> {
  const isDbActive = await checkDbConnection();

  if (isDbActive) {
    try {
      await prisma.resume.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      console.warn("Prisma deleteResume failed, falling back to local storage.", e);
    }
  }

  // Local storage fallback
  const db = readLocalDb();
  const initialLength = db.resumes.length;
  db.resumes = db.resumes.filter((r) => r.id !== id);
  writeLocalDb(db);
  return db.resumes.length < initialLength;
}

export async function duplicateResume(id: string): Promise<any | null> {
  const original = await getResumeById(id);
  if (!original) return null;

  const title = `${original.title} (Copy)`;
  return await createResume(
    original.userId,
    title,
    original.templateId,
    original.themeConfig,
    original.data
  );
}
