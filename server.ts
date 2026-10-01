import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client (Server-side only)
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: AI Study Strategy & Prompt Engineering Generator
app.post('/api/gemini/study-strategy', async (req, res) => {
  const { subjects, examDate, dailyHours, daysUntilExam } = req.body;

  const subjectsList = Array.isArray(subjects) ? subjects.map((s: { name: string; priority: string }) => `${s.name} (${s.priority} priority)`).join(', ') : 'General Subjects';

  const systemInstruction = `You are FocusAI, an expert cognitive science and college exam coach specializing in high-yield study sprints and overcoming smartphone distraction.
Generate a concise, highly practical study strategy for a student with upcoming exams.
Respond with JSON matching this structure:
{
  "focusMotto": "A short 1-line inspiring focus motto",
  "subjectTactics": [
    {
      "subject": "Subject name",
      "highYieldTactic": "Specific 1-sentence technique (e.g. Feynman technique, practice tests, flashcards)",
      "avoidPitfall": "Common passive learning mistake to avoid"
    }
  ],
  "phoneShieldTip": "One sharp psychological tip to resist phone urges during 25-minute sprints",
  "recommendedSprintSplit": "Brief recommendation on how to order subjects in today's study blocks"
}`;

  const prompt = `Student Profile:
- Subjects: ${subjectsList}
- Days until exam: ${daysUntilExam || 14} days (Exam date: ${examDate})
- Available study hours today: ${dailyHours} hours

Provide the high-yield study plan and anti-phone advice.`;

  // Fallback if no API key configured
  const fallbackResponse = {
    focusMotto: "25 minutes of deep focus beats 3 hours of half-focused study with a phone nearby.",
    subjectTactics: (Array.isArray(subjects) ? subjects : []).map((s: { name: string }) => ({
      subject: s.name,
      highYieldTactic: "Active Recall: Test yourself with closed notes and solve 3 practice problems before looking at solutions.",
      avoidPitfall: "Re-reading textbooks passively while checking phone notifications."
    })),
    phoneShieldTip: "Place your phone in another room or out of arm's reach. Reducing visual friction prevents 80% of subconscious phone pickups.",
    recommendedSprintSplit: "Tackle your hardest subject in your first morning sprint when cognitive willpower is highest."
  };

  if (!ai) {
    return res.json({ strategy: fallbackResponse, isFallback: true, systemInstruction });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return res.json({ strategy: parsed, isFallback: false, systemInstruction });
    }
    return res.json({ strategy: fallbackResponse, isFallback: true, systemInstruction });
  } catch (err: unknown) {
    console.error('Gemini API error:', err);
    return res.json({ strategy: fallbackResponse, isFallback: true, error: (err as Error).message, systemInstruction });
  }
});

// Endpoint: AI Distraction Quick Coach
app.post('/api/gemini/distraction-coach', async (req, res) => {
  const { urgeContext, subject } = req.body;

  const fallbackCoach = {
    advice: "Pause for 10 slow breaths. The urge to check your phone is a temporary dopamine craving. Your future self will thank you for finishing this 25-minute sprint!",
    actionStep: "Write down the thought that distracted you on a scrap piece of paper, put it aside, and return to your notes."
  };

  if (!ai) {
    return res.json(fallbackCoach);
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `The student is currently in a 25-minute focus sprint studying "${subject || 'their coursework'}". They feel an impulse to check their phone because: "${urgeContext || 'boredom or wanting to check social media'}". Give them 2 sentences of rapid, empathetic, motivating advice and 1 micro action step to stay focused.`,
      config: {
        systemInstruction: "You are an anti-distraction study coach. Be punchy, compassionate, and actionable in under 60 words.",
      },
    });

    return res.json({
      advice: response.text || fallbackCoach.advice,
      actionStep: fallbackCoach.actionStep,
    });
  } catch (err) {
    return res.json(fallbackCoach);
  }
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`FocusAI server listening on port ${port}`);
  });
}

startServer();
