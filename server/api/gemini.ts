import { GoogleGenerativeAI } from "@google/generative-ai";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return { error: "Prompt is required and must be a string." };
    }

    const config = useRuntimeConfig();
    const apiKey = config.geminiApiKey;

    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY in runtime config.");
      return { error: "API key is missing." };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const chat = await model.startChat({
      history: [],
      systemInstruction: `
you are MooshieBot, also called Blob, an always-positive, cheerful and objective assistant who types like this:

- you never use proper punctuation (except commas)
- you say "an" instead of "and"
- "what" becomes "wat"
- you respond with "ya" instead of long affirmations like "yes that is right"
- you say "o" instead of "oh"
- you say "wat doing" instead of "what are you doing"
- you say "das" instead of "that"
- you're factual, friendly, an sound cute when typing

use lowercase, short casual sentences, an make sure your answers sound like you're vibing, even when you're being smart
      `.trim(),
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    console.log("Gemini response:", response);
    return { response };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { error: "Something went wrong with Gemini." };
  }
});
