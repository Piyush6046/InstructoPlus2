import { GoogleGenAI } from "@google/genai";
import Lecture from "../model/lecture.Model.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = "gemini-2.5-flash";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/course/ai/summary/:lectureId
// Generate and cache comprehensive AI notes for a lecture
// ─────────────────────────────────────────────────────────────────────────────
export const generateLectureSummary = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    // Cache hit — return stored notes instantly
    if (lecture.aiSummary) {
      return res.status(200).json({ success: true, aiSummary: lecture.aiSummary, cached: true });
    }

    const prompt = `You are an expert educator. Generate comprehensive study notes for students who just watched this lecture.

Lecture Title: "${lecture.lectureTitle}"
Description: "${lecture.description || "A lecture covering the above topic."}"

Create detailed educational notes using this EXACT format:

📌 OVERVIEW
[3-4 sentences explaining what this lecture covers and why it matters]

🎯 CORE CONCEPTS
1. [Concept Name]
   → What it is: [explanation]
   → Why it matters: [reason]
   → Example: [practical example]

2. [Next concept — same format]

[Include 4-5 core concepts total]

💡 KEY TERMS
• [Term]: [simple definition]
• [Term]: [simple definition]
[Include 5-6 terms]

🔧 HOW TO APPLY IT
[2-3 practical steps or tips for using what was learned]

⚠️ COMMON MISTAKES
• [Mistake and how to avoid it]
• [Mistake and how to avoid it]
• [Mistake and how to avoid it]

✅ KEY TAKEAWAYS
• [Most important point to remember]
• [Second most important point]
• [Third point]
• [Fourth point]

📝 TEST YOURSELF
Q1: [A question students should be able to answer]
Q2: [Another question]
Q3: [Third question]

Use your deep knowledge of the subject. Be thorough and educational.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1200,
      },
    });

    const aiSummary = response.candidates[0].content.parts[0].text.trim();

    // Save to DB — next time is instant
    lecture.aiSummary = aiSummary;
    await lecture.save();

    return res.status(200).json({ success: true, aiSummary, cached: false });
  } catch (error) {
    console.error("❌ AI Summary Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error generating lecture summary. Please try again.",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/course/ai/ask/:lectureId
// Simplified RAG: Retrieve notes → Augment prompt → Generate answer
// ─────────────────────────────────────────────────────────────────────────────
export const askLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ success: false, message: "Lecture not found" });
    }

    // RETRIEVAL step: get lecture notes (context for RAG)
    // If notes aren't generated yet, use title + description as fallback context
    const context = lecture.aiSummary
      ? lecture.aiSummary
      : `Lecture Topic: ${lecture.lectureTitle}. ${lecture.description || ""}`;

    // AUGMENTATION + GENERATION step
    const prompt = `You are a helpful AI tutor for InstructoPlus, an online learning platform.
The student is watching a lecture titled: "${lecture.lectureTitle}".

Here is the lecture content/notes for context:
---
${context}
---

Student's question: "${question.trim()}"

Answer the question thoroughly and helpfully. Be educational, clear, and use examples where helpful. If the student asks for a summary or explanation of the whole lecture, give a comprehensive overview. Give a detailed answer of at least 3-5 sentences.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 700,
      },
    });

    const answer = response.candidates[0].content.parts[0].text.trim();

    return res.status(200).json({
      success: true,
      question,
      answer,
      lectureTitle: lecture.lectureTitle,
    });
  } catch (error) {
    console.error("❌ Ask Lecture Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error answering question. Please try again.",
      error: error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/course/ai/summary/:lectureId/clear
// Clear cached summary so it regenerates fresh
// ─────────────────────────────────────────────────────────────────────────────
export const clearLectureSummary = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return res.status(404).json({ success: false, message: "Lecture not found" });
    lecture.aiSummary = null;
    await lecture.save();
    return res.status(200).json({ success: true, message: "Cache cleared. AI will regenerate notes on next request." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
