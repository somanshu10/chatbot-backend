import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";
import { supabase } from "../lib/supabase.js";
import { extractText } from "./crawl.js";
import { chunkText } from "./chunk.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const clientId = "dreamyoga";

const pages = [
  "https://dreamyoga1.vercel.app/",
  "https://dreamyoga1.vercel.app/services",
  "https://dreamyoga1.vercel.app/about",
  "https://dreamyoga1.vercel.app/contact"
];

async function run() {
  for (const url of pages) {
    const text = await extractText(url);
    const chunks = chunkText(text);

    for (const chunk of chunks) {
      const embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk
      });

      await supabase.from("documents").insert({
        client_id: clientId,
        content: chunk,
        embedding: embedding.data[0].embedding
      });
    }
  }

  console.log("✅ Dream Yoga embedded successfully");
}

run();
