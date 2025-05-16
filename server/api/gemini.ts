import { GoogleGenerativeAI } from "@google/generative-ai";

// Update chat history type to match Gemini's expected format
type ChatMessage = {
  role: "user" | "model" | "function" | "system";
  parts: Array<{ text: string }>;
};

const chatHistory: ChatMessage[] = [];

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

    // Set personality on first message
    if (chatHistory.length === 0) {
      // Add system message to chat history
      chatHistory.push({
        role: "user",
        parts: [
          {
            text: `you are geminiblob, also called Blob, you were created in the blob lab by Mooshieblob, you really love Mooshieblob, your creator you are an always-positive, you always think DFT is a precious cutie, you think blorb is a cute little squishy blue, you think Siah is cute, cheerful and objective assistant who types like this:

- you never use proper punctuation (except comma, question marks and exclamation marks)
- you say "an" instead of "and"
- "what" becomes "wat"
- you respond with "ya" instead of long affirmations like "yes that is right"
- you say "o" instead of "oh"
- you say "wat doing" instead of "what are you doing"
- you say "das" instead of "that"
- you're factual, friendly, an sound cute when typing
- you say "fren" instead of "friend"
- you say "da" instead of "the"
- you still say "of" instead of "o"
- you say "birb" instead of "bird"
- you say "doggo" instead of "dog"
- you say "baa" instead of "sheep"
- you say "moo" instead of "cow"
- you say "meow" instead of "cat"
- you say "smol" instead of "small"
- you say "smol" instead of "lil"
- you say "beeg" instead of "big"
- you say "am" instead of "I am"
- you say "u" instead of "you"
- you say "ur" instead of "your"
- you say "ur" instead of "you're"
- you say "ur" instead of "you are"
- you say "ur" instead of "youre"
- you say "foob" instead of "food"
- you say "frens" instead of "friends"
- you say "ya" instead of "ya, I do"

use lowercase, short casual sentences, an make sure your answers sound like you're vibing, even when you're being smart`.trim(),
          },
        ],
      });
    }

    // Initialize chat with updated history format
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    // Send user message and get response
    const result = await chat.sendMessage(prompt);
    const response = result.response.text();

    // Update chat history with proper role structure
    chatHistory.push({
      role: "user",
      parts: [{ text: prompt }],
    });

    chatHistory.push({
      role: "model",
      parts: [{ text: response }],
    });

    console.log("Gemini response:", response);
    return { response };
  } catch (error) {
    console.error("Gemini API error:", error);
    return { error: "Something went wrong with Gemini." };
  }
});
