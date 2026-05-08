function safeJSONParse(text) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);

    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        return null;
      }
    }

    return null;
  }
}

export async function analyzeArticle(articleText) {
  console.log("Analyzing article with AI...");
  console.log("Article length:", articleText.length);

  const prompt = `
You are a STRICT JSON API.

Return ONLY valid JSON.

NO markdown.
NO backticks.
NO explanations.

If unsure:
{
  "summary": "unknown",
  "key_points": [],
  "statistics": [],
  "entities": {
    "countries": [],
    "organizations": [],
    "people": []
  },
  "timeline": [],
  "causes": [],
  "impacts": [],
  "policy_implications": [],
  "bangladesh_context": "unknown",
  "sentiment": "neutral",
  "mindmap": {}
}

ARTICLE:
${articleText}
`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer `, // ❌ never hardcode key
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.1-8b-instruct",
      temperature: 0.2,
      messages: [
        { role: "user", content: prompt } // ✅ FIXED: real prompt used
      ]
    })
  });

  const data = await response.json();

  console.log("AI response received");

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    console.log("❌ Empty AI response");
    return fallback();
  }

  console.log("AI RAW:", content);

  const parsed = safeJSONParse(content);

  if (!parsed) {
    console.log("❌ INVALID JSON:", content);
    return fallback();
  }

  console.log("✅ VALID JSON");
  return parsed;
}

// 🔥 fallback function (single source of truth)
function fallback() {
  return {
    summary: "",
    key_points: [],
    statistics: [],
    entities: {
      countries: [],
      organizations: [],
      people: []
    },
    timeline: [],
    causes: [],
    impacts: [],
    policy_implications: [],
    bangladesh_context: "unknown",
    sentiment: "neutral",
    mindmap: {}
  };
}
