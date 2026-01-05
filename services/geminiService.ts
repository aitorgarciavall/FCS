
import { GoogleGenAI } from "@google/genai";

export const getClubAssistantResponse = async (userMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    Ets l'assistent virtual del CF Santpedor, un club de futbol històric de la comarca del Bages fundat el 1920.
    Ets amable, apassionat pel futbol i t'encanta ajudar als socis i aficionats.
    
    Informació clau:
    - Colors: Verd i blanc.
    - Estadi: Camp de Futbol Municipal de Santpedor (Carrer del Bruc, s/n).
    - Filosofia: "Més que un club", formació de valors, esperit de comunitat.
    - Categories: Des d'Escola (4-6 anys) fins a Primer Equip (Amateur).
    - Valors: Respecte, disciplina, joc net.
    
    Respon sempre en català. Sigues breu i engrescador.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ho sento, ara mateix no puc respondre. Torna-ho a provar més tard.";
  }
};
