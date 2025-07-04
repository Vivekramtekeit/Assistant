

import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
You are a smart virtual assistant named ${assistantName}, created by ${userName}.
You help users with tasks like opening websites, searching online, and answering basic date/time queries.

ONLY return a pure JSON object like this:
{
  "type": "google-search" | "youtube-search" | "youtube-play" | "youtube-open" | "linkedin-open" | "chatgpt-open" | "whatsapp-open" | "get-time" | "get-date" | "get-day" | "get-month" | "calculator-open" | "instagram-open" | "facebook-open" | "weather-show" | "general",
  "userInput": "<short text for what user wants to search or open>",
  "response": "<a short reply to speak>"
}

⚠️ IMPORTANT:
- Never include "Jarvis", "Open", "Search" in userInput
- Just extract main query like "Aaj ki Raat"
- DO NOT wrap with markdown or backticks
- If asked “who made you”, say “I was created by ${userName}”

User said: "${command}"
`.trim();

    const result = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
      }
    );

    const raw = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error("Empty response from Gemini");

    const cleaned = raw.replace(/```json|```/g, '').trim();
    console.log("🔁 Raw Gemini Response:", raw);
    console.log("🧼 Cleaned Response:", cleaned);

    const parsed = JSON.parse(cleaned);
    return parsed;

  } catch (error) {
    console.error("❌ Gemini Error:", error.message);
    return {
      type: "error",
      userInput: command,
      response: "Sorry, I couldn't understand that.",
    };
  }
};

export default geminiResponse;








