import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFocusStrategy = async (task: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `The user wants to focus on this task: "${task}".
      Provide a concise, 3-step actionable strategy to tackle this task effectively in a 25-minute Pomodoro session.
      Keep it very brief (max 30 words per step). Use a motivating but calm tone.
      Format the output as a simple numbered list.`
    });
    
    return response.text || "Could not generate a strategy. Just breathe and start.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Focus is key. Break your task into small steps and begin.";
  }
};