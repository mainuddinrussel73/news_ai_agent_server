import axios from "axios";
import * as cheerio from "cheerio";
import { isRecent } from "../utils/extractDate.js";

async function getDate(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const metaDate =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").attr("datetime");

    return metaDate;
  } catch {
    return null;
  }
}

export async function scrapeDailyStar() {
  const { data } = await axios.get("https://www.thedailystar.net/");
  const $ = cheerio.load(data);

  const results = [];

  const links = $("a");

  for (let i = 0; i < links.length; i++) {
    const el = links[i];
    const href = $(el).attr("href");
    const title = $(el).text().trim();

    if (!href) continue;

    if (href.includes("/news/") || href.includes("/opinion/")) {
      const url = href.startsWith("http")
        ? href
        : `https://www.thedailystar.net${href}`;

      const date = await getDate(url);

      if (!isRecent(date, 1)) continue;

      results.push({
        title: title || "Untitled",
        url,
        date,
        source: "Daily Star"
      });
    }
  }

  return results;
}
