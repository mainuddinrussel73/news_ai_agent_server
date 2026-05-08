import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: String,
  url: { type: String, unique: true },
  source: String,
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Article", articleSchema);
