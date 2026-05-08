// utils/extractDate.js
export function extractDateFromDOM() {
  // 1. meta tags
  let date =
    document.querySelector('meta[property="article:published_time"]')?.content ||
    document.querySelector('meta[name="pubdate"]')?.content ||
    document.querySelector('meta[name="date"]')?.content;

  // 2. <time>
  if (!date) {
    const time = document.querySelector("time");
    if (time) {
      date = time.getAttribute("datetime") || time.innerText;
    }
  }

  // 3. JSON-LD
  if (!date) {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (const s of scripts) {
      try {
        const json = JSON.parse(s.innerText);

        const findDate = (obj) => {
          if (!obj) return null;

          if (obj.datePublished) return obj.datePublished;
          if (obj.uploadDate) return obj.uploadDate;

          if (obj["@graph"]) {
            for (const g of obj["@graph"]) {
              if (g.datePublished) return g.datePublished;
            }
          }
        };

        if (Array.isArray(json)) {
          for (const item of json) {
            const d = findDate(item);
            if (d) return d;
          }
        } else {
          const d = findDate(json);
          if (d) return d;
        }
      } catch {}
    }
  }

  return date || null;
}
