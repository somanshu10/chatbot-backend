import OpenAI from "openai";
import { supabase } from "../lib/supabase.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, clientId } = req.body;

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: message
  });

  const { data } = await supabase.rpc("match_documents", {
    query_embedding: embedding.data[0].embedding,
    match_count: 5,
    client: clientId
  });

  const context = data.map(d => d.content).join("\n\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Answer ONLY using the context below.\n\n${context}`
      },
      { role: "user", content: message }
    ],
    temperature: 0.2
  });

  res.json({ reply: completion.choices[0].message.content });
}
