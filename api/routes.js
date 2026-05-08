import express from "express";
import { runMultiNewsScraper } from "../scrapers/playwrightScraper.js";

export default function setupRoutes(io) {
  const router = express.Router();

  router.get("/crawl", async (req, res) => {
    const data = await runMultiNewsScraper(io);

    res.json({
      total: data.length,
      articles: data
    });
  });

  return router;
}
