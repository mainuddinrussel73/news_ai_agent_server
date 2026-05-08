let progress = {
  status: "idle",
  completed: 0,
  total: 4,
  logs: []
};

export function updateProgress(update) {
  progress.logs.push(update);

  if (update.status === "done") {
    progress.completed++;
  }

  global.io.emit("progress", progress);
}

export function getProgress() {
  return progress;
}
