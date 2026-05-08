import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const crawlerQueue = new Queue("crawler", {
  connection
});