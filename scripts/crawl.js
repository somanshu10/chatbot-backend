import fetch from "node-fetch";
import { JSDOM } from "jsdom";

export async function extractText(url) {
  const res = await fetch(url);
  const html = await res.text();
  const dom = new JSDOM(html);

  return dom.window.document.body.textContent
    .replace(/\s+/g, " ")
    .trim();
}
