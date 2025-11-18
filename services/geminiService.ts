import { GoogleGenAI, Type, Schema } from "@google/genai";

// Hardcoded vocabulary from the user's textbook images to guide the AI
const TARGET_VOCABULARY = [
  "get up", "get dressed", "have breakfast", "walk the dog", "go to school",
  "have lunch", "make a snack", "do homework", "have a shower", "go to bed",
  "sleep pods", "energy", "tired", "teenagers", "hobbies", "play football",
  "play computer games", "listen to music", "watch TV", "chat online",
  "usually", "always", "sometimes", "never", "rarely", "often",
  "go to the cinema", "ride a bike", "meet friends", "play an instrument"
];

// Random elements to force story variety
const PROTAGONISTS = ["Alex", "Mia", "Lucas", "Sofia", "Leo", "Emma", "Max", "Chloe"];
const PLOT_SCENARIOS = [
    "A chaotic Monday morning where everything goes wrong (waking up late, missing the bus).",
    "A very relaxed Sunday focused entirely on hobbies and free time.",
    "A funny school day involving the new futuristic 'sleep pods' in the classroom.",
    "Preparing for a big sports match or competition after school.",
    "A day in the life of a teenager who is obsessed with technology and gaming.",
    "A surprise test at school and studying together with friends.",
    "Trying to learn a new difficult hobby (like an instrument) and failing at first.",
    "A day where the protagonist has to take care of a pet (walking the dog, feeding it) while busy."
];

export const generateStoryAndQuiz = async (): Promise<{ title: string, content: string, questions: any[] } | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  // Pick random elements
  const protagonist = PROTAGONISTS[Math.floor(Math.random() * PROTAGONISTS.length)];
  const scenario = PLOT_SCENARIOS[Math.floor(Math.random() * PLOT_SCENARIOS.length)];

  const questionSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      text: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      },
      correctAnswer: { type: Type.STRING },
      evidence: { type: Type.STRING, description: "The EXACT sentence or phrase from the story that provides the answer to this question. Must match the text exactly." }
    },
    required: ["id", "text", "options", "correctAnswer", "evidence"]
  };

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING, description: "A fun short story (approx 150 words) for a 12 year old ESL student." },
      questions: {
        type: Type.ARRAY,
        items: questionSchema,
        description: "3 reading comprehension questions based on the story."
      }
    },
    required: ["title", "content", "questions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a UNIQUE and fun short story for a 12-year-old English student.
      
      Protagonist: ${protagonist}
      Specific Plot Scenario: ${scenario}
      Grammar focus: Present Simple (Affirmative, Negative) and Adverbs of Frequency.
      
      You MUST include at least 6 of these words/phrases naturally in the text: ${TARGET_VOCABULARY.join(', ')}.
      
      Make sure the story is CREATIVE and DIFFERENT from a generic routine description.
      
      Also generate 3 multiple choice questions to test comprehension. 
      IMPORTANT: For each question, provide the 'evidence' field which is the EXACT quote from the text that proves the answer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8, // Increased temperature for more variety
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("Error generating story:", error);
    return null;
  }
};

export const generateGameContent = async (gameType: 'SCRAMBLE' | 'GAPFILL'): Promise<any> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;

  const ai = new GoogleGenAI({ apiKey });

  try {
    if (gameType === 'SCRAMBLE') {
      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          sentences: {
            type: Type.ARRAY,
            items: { 
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                explanation: { type: Type.STRING, description: "Brief explanation in Spanish about the word order (e.g. Subject + Frequency Adverb + Verb)." }
              },
              required: ["text", "explanation"]
            },
            description: "List of 5 sentences using Present Simple and Adverbs of Frequency with explanations."
          }
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 5 different sentences for a "Sentence Scramble" game for a 12-year-old ESL student.
        Focus: Present Simple, Daily Routines, Hobbies, Adverbs of Frequency (usually, often, never).
        Examples: "I usually get up at 7 o'clock", "She doesn't play football".
        Keep them simple but grammatically correct. Use vocabulary: ${TARGET_VOCABULARY.slice(0, 10).join(', ')}.
        Provide a brief explanation in Spanish for the word order of each sentence.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.8
        }
      });
      
      return response.text ? JSON.parse(response.text).sentences : null;
    } 
    
    if (gameType === 'GAPFILL') {
      const schema: Schema = {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: "Sentence with a gap represented by '______' and the verb in brackets e.g. 'She ______ (play)'" },
                answer: { type: Type.STRING, description: "The correct conjugated verb" },
                options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 options including the correct one" },
                explanation: { type: Type.STRING, description: "Grammar explanation in Spanish suitable for a 12 year old." }
              },
              required: ["text", "answer", "options", "explanation"]
            }
          }
        }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate 5 multiple choice grammar questions for Present Simple (Affirmative/Negative/Interrogative).
        Target audience: 12 year old Spanish student learning English.
        The 'explanation' field MUST be in SPANISH and explain WHY the answer is correct (e.g. 3rd person 's').`,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.8
        }
      });

      return response.text ? JSON.parse(response.text).questions : null;
    }

  } catch (error) {
    console.error("Error generating game content:", error);
    return null;
  }
};