import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;
let redisConnection: IORedis | null = null;
let pdfQueue: Queue | null = null;

// Initialize connection safely
if (REDIS_URL) {
  try {
    redisConnection = new IORedis(REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true, // Don't block startup
    });
    
    // Catch connection errors
    redisConnection.on("error", (err) => {
      console.warn("Redis connection error, falling back to synchronous execution. Error:", err.message);
      redisConnection = null;
      pdfQueue = null;
    });

    pdfQueue = new Queue("pdf-generation", { connection: redisConnection as any });
  } catch (error) {
    console.warn("Failed to initialize Redis client:", error);
    redisConnection = null;
    pdfQueue = null;
  }
}

export interface JobData {
  resumeId: string;
  templateId: string;
  data: any;
}

// Queue a job or run it immediately in sync fallback mode
export async function queuePdfGeneration(jobId: string, data: JobData, processor: (data: JobData) => Promise<any>) {
  if (pdfQueue && redisConnection) {
    try {
      const job = await pdfQueue.add(jobId, data, {
        attempts: 3,
        backoff: 1000,
      });
      return { status: "queued", jobId: job.id };
    } catch (error) {
      console.warn("Failed to queue job on Redis, running inline:", error);
    }
  }

  // Synchronous Fallback
  console.log(`Running PDF generation job ${jobId} synchronously...`);
  try {
    const result = await processor(data);
    return { status: "completed", result };
  } catch (error) {
    console.error("Synchronous PDF job failed:", error);
    throw error;
  }
}

// Setup standard worker if Redis is connected
export function startPdfWorker(processor: (job: Job<JobData>) => Promise<any>) {
  if (redisConnection) {
    const worker = new Worker("pdf-generation", processor, { connection: redisConnection as any });
    
    worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err);
    });

    return worker;
  }
  return null;
}
