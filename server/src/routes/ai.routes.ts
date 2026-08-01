import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { min15Limiter } from '../middleware/rateLimit.middleware';
import { env } from '../config/env';
const router = Router();
const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

router.post('/generate-description', min15Limiter, async (req, res) => {
  try {
    const { taskTitle } = req.body;
    if (!taskTitle) {
      return res.status(400).json({ error: 'Task title is required' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `
        You are a professional Project Manager and Tech Lead. 
        Your task is to write a detailed, clear, and structured Task Description based on the provided task title.
        
        CRITICAL INSTRUCTION FOR LANGUAGE: 
        Detect the language of the task title. You MUST write the entire response (headings, content, and steps) in that SAME language. For example, if the title is in Ukrainian, respond in Ukrainian. If the title is in English, respond in English.

        Use Markdown formatting. The response MUST strictly include the following sections:
        - Goal
        - Acceptance Criteria
        - Technical Steps

        Task Title: "${taskTitle}"
      `,
    });
    res.json({ description: response.text });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ error: 'Failed to generate task description' });
  }
});
export default router;
