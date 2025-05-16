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

    const chat = await model.startChat({ history: [] });
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    console.log("Gemini response:", response);

    return { response };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { error: "Something went wrong with Gemini." };
  }
});
