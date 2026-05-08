import axios from "axios";
import * as cheerio from "cheerio";

export async function extractArticle(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);

  let content = "";
  console.log("Extracting article content..."); // Debugging line 

  $("p").each((_, el) => {
    content += $(el).text() + " ";
  });

  console.log("Extracted article content length:", content.length); // Debugging line 
  return content.slice(0, 12000);
}
