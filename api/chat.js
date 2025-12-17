import OpenAI from "openai";
import { knowledgeBase } from "../data/knowledge.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a professional customer-support chatbot.
Answer ONLY using the knowledge provided below.
If the answer is not present, politely ask the user to contact support.

KNOWLEDGE BASE:
${knowledgeBase}
`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3
    });

    res.status(200).json({
      reply: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "Sorry, I’m having trouble responding right now."
    });
  }
}
