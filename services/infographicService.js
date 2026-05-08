export function buildInfographicData(data) {
  return {
    title: "News Intelligence Report",
    sections: [
      { type: "summary", content: data.summary },
      { type: "key_points", content: data.key_points },
      { type: "stats", content: data.statistics },
      { type: "timeline", content: data.timeline },
      { type: "impacts", content: data.impacts }
    ]
  };
}
