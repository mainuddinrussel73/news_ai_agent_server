import { scrapeProthomAlo } from "../scrapers/prothomalo.js";
import { scrapeDailyStar } from "../scrapers/dailystar.js";

const seen = new Set(); // in-memory deduplication

export async function getAllArticles() {
  const all = [];

  const sources = [
    scrapeProthomAlo,
    scrapeDailyStar
  ];

  for (const scraper of sources) {
    const articles = await scraper();
    console.log(`Scraped ${articles.length} articles from ${articles[0]?.source || "unknown source"}`);
    for (const a of articles) {
      if (seen.has(a.url)) continue;

      seen.add(a.url);
      all.push(a);
    }
  }

  return all;
}
