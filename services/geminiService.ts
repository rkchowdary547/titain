import { GoogleGenAI, Type } from "@google/genai";
import { Macros, MealPlan, Workout, Exercise } from '../types';

// Initialize Gemini
// Note: In a production app, the key must be handled securely via backend proxy or strictly environment variables.
// The prompt specifies usage of process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export interface FoodAnalysisResult {
  foodName: string;
  grams: number;
  macros: Macros;
  confidence: number;
}

export const analyzeFoodImage = async (base64Image: string): Promise<FoodAnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Optimized for speed and general tasks
    const prompt = `
      Analyze this image of food. Identify the main dish or components.
      1. Estimate the TOTAL weight in grams of the serving shown.
      2. Estimate the TOTAL macronutrients (Calories, Protein, Carbs, Fats, Fiber) for that entire estimated weight.
      3. Provide a confidence score between 0 and 1 based on how clear the food and portion size are.
      
      Return ONLY valid JSON with this structure, no markdown formatting:
      {
        "foodName": "string",
        "grams": number,
        "macros": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
        },
        "confidence": number
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming JPEG for simplicity in this demo context
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for more deterministic/factual output
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const result = JSON.parse(cleanJson) as FoodAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

// Fallback for Manual Search if local DB misses
export const searchFoodDatabase = async (query: string): Promise<FoodAnalysisResult> => {
   try {
    const modelId = "gemini-2.5-flash";
    const prompt = `
      You are a nutrition database. The user is searching for: "${query}".
      Provide standard nutritional info for 100g of this item.
      Return ONLY valid JSON:
      {
        "foodName": "Standardized Name",
        "grams": 100,
        "macros": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
        },
        "confidence": 1
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
   } catch (error) {
     console.error("Search Failed", error);
     throw error;
   }
};

// --- COACH AI GENERATION TOOLS ---

export interface AiDietResult {
  macros: Macros;
  mealPlan: MealPlan;
}

export const generateAiDiet = async (
  clientDetails: { age: number, weight: number, goal: string, gender?: string }
): Promise<AiDietResult> => {
  try {
    const modelId = "gemini-2.5-flash";
    const prompt = `
      Create a personalized daily nutrition plan for a client with these details:
      - Age: ${clientDetails.age}
      - Current Weight: ${clientDetails.weight}kg
      - Goal: ${clientDetails.goal}
      
      1. Calculate appropriate daily macro targets (Calories, Protein, Carbs, Fats, Fiber).
      2. Create a meal suggestion for Breakfast, Lunch, Dinner, and Snack that fits these macros.
      3. Include diverse options, including healthy Indian cuisine if appropriate or relevant to general healthy eating.
      
      Return ONLY valid JSON:
      {
        "macros": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fats": number,
          "fiber": number
        },
        "mealPlan": {
          "breakfast": "string",
          "lunch": "string",
          "dinner": "string",
          "snack": "string"
        }
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.7 }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (error) {
    console.error("AI Diet Gen Failed", error);
    throw error;
  }
};

export const generateAiWorkout = async (
  clientDetails: { goal: string },
  day: string,
  focus?: string
): Promise<{ title: string, exercises: Partial<Exercise>[] }> => {
  try {
    const modelId = "gemini-2.5-flash";
    const prompt = `
      Create a workout routine for a client with Goal: "${clientDetails.goal}".
      Day: ${day}
      Focus Area: ${focus || 'General'}
      
      Return a workout Title and 4-6 Exercises.
      For each exercise, provide name, sets (number), and reps (string range).
      
      Return ONLY valid JSON:
      {
        "title": "string",
        "exercises": [
          { "name": "string", "sets": number, "reps": "string" }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.7 }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    const result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
    
    // Map to ensure IDs exist for frontend keys
    result.exercises = result.exercises.map((ex: any) => ({
      ...ex,
      id: 'ai-' + Math.random().toString(36).substr(2, 9),
      completed: false
    }));
    
    return result;
  } catch (error) {
    console.error("AI Workout Gen Failed", error);
    throw error;
  }
};