import cron from "node-cron";
import { runCrawler } from "../services/crawler.js";

export function startCron() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Running crawler...");
    await runCrawler();
  });
}
