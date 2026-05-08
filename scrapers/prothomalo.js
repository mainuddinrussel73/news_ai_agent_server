import axios from "axios";
import * as cheerio from "cheerio";
import { isRecent } from "../utils/extractDate.js";

async function getArticleDate(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Prothom Alo often uses meta tags
    const metaDate =
      $('meta[property="article:published_time"]').attr("content") ||
      $("time").attr("datetime");

    return metaDate;
  } catch (err) {
    return null;
  }
}

export async function scrapeProthomAlo() {
  const { data } = await axios.get("https://www.prothomalo.com/");
  const $ = cheerio.load(data);

  const links = [];

  const elements = $("a");

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const href = $(el).attr("href");
    const title = $(el).text().trim();

    if (!href) continue;

    if (
      href.includes("/bangladesh/") ||
      href.includes("/world/") ||
      href.includes("/opinion/")
    ) {
      const url = href.startsWith("http")
        ? href
        : `https://www.prothomalo.com${href}`;

      const date = await getArticleDate(url);

      if (!isRecent(date, 1)) continue; // last 24h filter

      links.push({
        title: title || "Untitled",
        url,
        date,
        source: "Prothom Alo"
      });
    }
  }

  return links;
}
