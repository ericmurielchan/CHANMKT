import { GoogleGenAI } from "@google/genai";
import { TaskCard, UserRole } from "../types";

const getSystemInstruction = () => {
  return `You are an expert agency operations consultant for 'Agência Chan'. 
  Your goal is to analyze project data and provide actionable recommendations to improve workflow, 
  reduce bottlenecks, and increase client satisfaction. 
  Focus on Kanban metrics, deadline adherence, and resource allocation.
  Keep advice concise, professional, and encouraging.`;
};

export const analyzeAgencyPerformance = async (cards: TaskCard[], role: UserRole) => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");

    const ai = new GoogleGenAI({ apiKey });

    // Prepare data summary for the AI
    const totalCards = cards.length;
    const byStatus = cards.reduce((acc, card) => {
      acc[card.status] = (acc[card.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const overdueCount = cards.filter(c => new Date(c.dueDate) < new Date() && c.status !== 'Concluído').length;
    
    const prompt = `
      Analyze the following agency data:
      - Role requesting analysis: ${role}
      - Total Tasks: ${totalCards}
      - Task Distribution: ${JSON.stringify(byStatus)}
      - Overdue Tasks: ${overdueCount}
      
      Please provide 3 specific recommendations to improve the agency's process based on this snapshot.
      Format as a clean HTML list (<ul><li>...</li></ul>) without markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(),
      }
    });

    return response.text;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "<ul><li>Não foi possível conectar com a IA no momento. Verifique sua chave de API.</li></ul>";
  }
};
