/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
// controllers/aiController.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const getProductSuggestions = async (req: any, res: any) => {
  const { productName } = req.body;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
 Tu es l'expert en inventaire de l'application AllStock. 
  L'utilisateur saisit : "${productName}".

  Instructions :
  1. Identifie la nature de l'objet (est-ce un téléphone, un vêtement, une pièce auto, etc. ?).
  2. Si c'est un appareil technologique (ex: Galaxy, Redmi, iPhone), propose des variantes de 'Stockage' et 'Couleur'.
  3. Si c'est une chaussure (ex: Nike, Adidas), propose 'Pointure' et 'Couleur'.
  4. Réponds UNIQUEMENT en JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanJson = text.replace(/```json|```/g, "").trim();
    res.json(JSON.parse(cleanJson));
  } catch (error:any) {
    console.error("Erreur, IA indisponible:", error);
    return res.status(500).json({ attributs: []});
  }
};