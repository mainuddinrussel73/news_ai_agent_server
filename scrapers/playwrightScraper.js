import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import pLimit from "p-limit";
import { loadCache, saveCache } from "../utils/cache.js";

const SITES = [
  {
    name: "prothomalo",
    base: "https://www.prothomalo.com",
    sections: [
      "/opinion",
      "/world",
    ]
  },
  {
    name: "bdnews24",
    base: "https://bangla.bdnews24.com",
    sections: [
      "/opinion",
      "/world",
    ]
  },
  {
    name: "bbc",
    base: "https://www.bbc.com",
    sections: [
      "/news/world",
      "news/articles",
    ]
  },
  {
    name: "aljazeera",
    base: "https://www.aljazeera.com",    
    sections: [
      "/opinion"
    ]
  } ,
  {
    name: "dailystarbangladesh",
    base: "https://www.thedailystar.net",
    sections: [
      "/opinion",
      "/slow-reads"

    ]
  },
  {
    name: "thebusinessstandard",
    base: "https://www.tbsnews.net",
    sections: [
      "/opinions"
    ]
  },
  {
    name: "kalbela",
    base: "https://www.kalbela.com",
    sections: [
      "/opinion",
      "/world"
    ]
  },
  {name: "kalerkantho", base: "https://www.kalerkantho.com", sections: ["/opinion"]},
  {name: "newagebd", base: "https://www.newagebd.net", sections: ["/opinion"]},
{name: "ittefaq", base: "https://www.ittefaq.com.bd", sections: ["/editorial"]},  

];

const limit = pLimit(5);

// ======================================================
// CATEGORY
// ======================================================
function getCategory(url) {
  try {
    const u = new URL(url);

    return (
      u.pathname
        .split("/")
        .filter(Boolean)[0] || "general"
    );
  } catch {
    return "general";
  }
}

// ======================================================
// AUTO SCROLL
// ======================================================
async function autoScroll(page) {
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, document.body.scrollHeight);
    });

    await new Promise(resolve => setTimeout(resolve, 1200));
  }
}

// ======================================================
// EXTRACT ARTICLE LINKS
// ======================================================
async function extractArticles(page) {
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a"))
      .map(a => ({
        title: a.innerText?.trim(),
        url: a.href
      }))
      .filter(
        a =>
          a.title &&
          a.url &&
          a.title.length > 10
      );
  });
}

// ======================================================
// GENERIC ARTICLE PARSER
// ======================================================
async function extractArticleDetails(page) {
  return await page.evaluate(() => {

    function extractParagraphs() {
      const selectors = [
        "article p",
        ".entry-content p",
        ".post-content p",
        ".content p",
        ".details p",
        ".story-element-text p",
        ".field--name-body p",
        "div[class*='content'] p",
        "div[class*='story'] p"
      ];

      for (const selector of selectors) {
        const nodes = document.querySelectorAll(selector);

        const texts = Array.from(nodes)
          .map(el => el.innerText?.trim())
          .filter(t =>
            t &&
            t.length > 40 &&              // remove noise
            !t.includes("cookie") &&     // remove banners
            !t.includes("subscribe")
          );

        if (texts.length > 2) {
          return texts;
        }
      }

      return [];
    }

    const paragraphs = extractParagraphs();

    const title =
      document.querySelector("h1")?.innerText?.trim() ||
      document.title ||
      "";

    const image =
      document.querySelector('meta[property="og:image"]')?.content ||
      document.querySelector("article img")?.src ||
      null;

    const date =
      document.querySelector("time")?.getAttribute("datetime") ||
      document.querySelector('meta[property="article:published_time"]')?.content ||
      null;

    const author =
      document.querySelector("[rel='author']")?.innerText?.trim() ||
      document.querySelector(".author")?.innerText?.trim() ||
      null;

    return {
      title,
      content: paragraphs.join("\n\n"),
      summary: paragraphs.slice(0, 3).join(" "),
      image,
      date,
      author
    };
  });
}

// ======================================================
// FILTER ARTICLES
// Only keep articles from the selected section
// ======================================================
function isSectionArticle(articleUrl, siteBase, section) {

  try {
    const u = new URL(articleUrl);

    if (!articleUrl.startsWith(siteBase)) {
      return false;
    }

    return u.pathname.startsWith(section);

  } catch {
    return false;
  }
}

// ======================================================
// MAIN SCRAPER
// ======================================================
export async function runMultiNewsScraper(io) {

  const browser = await puppeteer.launch({
  args: [
    ...chromium.args,
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-blink-features=AutomationControlled"
  ],
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
});

  

  // 🔥 LOAD CACHE FIRST
  const cached = loadCache();
  const results = [...cached];

  const seen = new Set(cached.map(a => a.url));

  console.log("📦 Loaded cache:", cached.length, "articles");

  let totalSections = 0;

  for (const site of SITES) {
    totalSections += site.sections.length;
  }

  let completed = 0;

  console.log("🚀 Bloomberg-style News Scraper Started");

  // ======================================================
  // LOOP SITES
  // ======================================================
  for (const site of SITES) {

    console.log(`\n🌐 SITE: ${site.name}`);

    // ======================================================
    // LOOP SECTIONS
    // ======================================================
    for (const section of site.sections) {

      const sectionUrl = site.base + section;

      console.log(`➡️ Section: ${sectionUrl}`);

      try {

        const page = await browser.newPage();

        await page.goto(sectionUrl, {
          waitUntil: "domcontentloaded",
          timeout: 30000
        });
        

        await autoScroll(page);

        let articles = await extractArticles(page);

        await page.close();

        // ======================================================
        // FILTER ONLY SECTION ARTICLES
        // ======================================================
        articles = articles.filter(a =>
          isSectionArticle(
            a.url,
            site.base,
            section
          )
        );

        // ======================================================
        // REMOVE DUPLICATES
        // ======================================================
        articles = articles.filter(a => {

          if (seen.has(a.url)) {
            return false;
          }

          seen.add(a.url);

          return true;
        });

        console.log(
          `✔ Found ${articles.length} articles`
        );

        // ======================================================
        // PROCESS ARTICLES
        // ======================================================
        const sectionResults = await Promise.all(

          articles.map(article =>
            limit(async () => {

              const page = await browser.newPage();

              try {

                await page.goto(article.url, {
                  waitUntil: "domcontentloaded",
                  timeout: 25000
                });

                await new Promise(resolve => setTimeout(resolve, 1500));
                const details =
                  await extractArticleDetails(page);

                return {

                  id: crypto.randomUUID(),

                  site: site.name,

                  section,

                  category: getCategory(article.url),

                  url: article.url,

                  title:
                    details.title ||
                    article.title,

                  summary: details.summary,

                  content: details.content,

                  image: details.image,

                  date: details.date,

                  author: details.author,

                  ai: null // 🚀 IMPORTANT
                  // AI WILL BE GENERATED
                  // ONLY WHEN USER CLICKS
                };

              } catch (err) {

                console.log(
                  `⚠️ Article Error: ${err.message}`
                );

                return null;

              } finally {

                await p.close();

              }
            })
          )
        );

        results.push(
          ...sectionResults.filter(Boolean)
        );
        // 🔥 save incrementally (prevents data loss)
        saveCache(results);

        completed++;

        // ======================================================
        // SOCKET PROGRESS
        // ======================================================
        io.emit("progress", {
          status: "running",
          site: site.name,
          section,
          completed,
          total: totalSections,
          articles: results.length
        });

      } catch (err) {

        console.log(
          `❌ Section Failed: ${sectionUrl}`,
          err.message
        );
      }
    }
  }

  await browser.close();
  // 🔥 MERGE + SAVE CACHE
  const merged = [...results];

  saveCache(merged);

  console.log("✅ Scraping complete:", merged.length);


  io.emit("progress", {
    status: "done",
    completed,
    total: totalSections,
    completed: totalSections,
  });

  return merged;
}