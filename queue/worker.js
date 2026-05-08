import { Worker } from "bullmq";
import { connection } from "../connection.js";

import { scrapeSection } from "../scrapers/playwrightScraper.js";
import { updateProgress } from "../progress/progressStore.js";


export const worker = new Worker(
  "crawler",
  async job => {
    const { section } = job.data;

    updateProgress({ status: "running", section });

    const result = await scrapeSection(section);

    updateProgress({
      status: "done",
      section,
      count: result.length
    });

    return result;
  },
  { connection, concurrency: 3 } // 🔥 parallel workers
);
