import { GoogleGenAI } from "@google/genai";
import { Product, TransactionRecord } from "../types/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

export const GeminiService = {
  /**
   * Analyzes sales data to provide strategic insights.
   */
  async analyzePerformance(transactions: TransactionRecord[], menu: Product[]) {
    if (!transactions.length) return "No data available for analysis.";

    const prompt = `
      You are the "Strategic Core" AI for a food business.
      
      Here is the menu:
      ${JSON.stringify(menu.map(m => ({ name: m.name, price: m.price, cat: m.categoryId })))}
      
      Here are the recent transactions:
      ${JSON.stringify(transactions.slice(0, 50))} // Limit context window
      
      Provide a brief, 3-bullet executive summary of performance.
      Identify one underperforming item and suggest a strategic price adjustment or marketing angle.
      Keep the tone professional but operational.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Analysis Failed", error);
      return "AI Strategic Analysis unavailable at this moment.";
    }
  },

  /**
   * Generates a kitchen-friendly description.
   */
  async generateKitchenNote(productName: string) {
    const prompt = `
      Write a very short (max 5 words) kitchen shorthand label for "${productName}".
      Example: "Double Chz Bgr"
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_FAST,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      return productName.substring(0, 10);
    }
  }
};