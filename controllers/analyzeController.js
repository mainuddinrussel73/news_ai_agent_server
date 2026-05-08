import { extractArticle } from "../services/scraper.js";
import { analyzeArticle } from "../services/aiService.js";
import { buildInfographicData } from "../services/infographicService.js";

export const analyzeNews = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    console.log("Received URL for analysis:", url); // Debugging line
    const articleText = await extractArticle(url);
    console.log("Article text extracted, length:", articleText.length); // Debugging line
    const aiData = await analyzeArticle(articleText);
    const infographic = buildInfographicData(aiData);

    res.json({
      ...aiData,
      infographic
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
