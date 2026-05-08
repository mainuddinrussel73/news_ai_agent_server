import express from "express";
import { scrapeTodayPlaywright } from "../scrapers/playwrightScraper.js";

const router = express.Router();




router.get("/articles", async (req, res) => {
  const data = await scrapeTodayPlaywright();

  console.log(data);
  console.log(`Total unique articles fetched: ${data.length}`); 
  res.json(
    data.slice(0, 100)
  );
});

export default router;
