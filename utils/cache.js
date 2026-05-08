import fs from "fs";
import path from "path";

const CACHE_FILE = path.resolve("cache/articles.json");

// ----------------------
// LOAD CACHE
// ----------------------
export function loadCache() {
  try {
    if (!fs.existsSync(CACHE_FILE)) return [];

    const data = fs.readFileSync(CACHE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.log("⚠ Cache load failed:", err.message);
    return [];
  }
}

// ----------------------
// SAVE CACHE
// ----------------------
export function saveCache(data) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
    console.log("💾 Cache saved:", data.length, "articles");
  } catch (err) {
    console.log("❌ Cache save failed:", err.message);
  }
}

// ----------------------
// CLEAR CACHE (optional)
// ----------------------
export function clearCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
    }
  } catch (err) {
    console.log("❌ Cache clear failed:", err.message);
  }
}