require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { YoutubeTranscript } = require("youtube-transcript");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const pdf = require("pdf-parse");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3001;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LESSON_KIT_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    summary: { type: "STRING" },
    chapters: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          timestamp: {
            type: "STRING",
            description:
              "Timestamp in format HH:MM:SS or MM:SS, or 'N/A' if not a video.",
          },
        },
      },
    },
    jargon: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          term: { type: "STRING" },
          definition: { type: "STRING" },
        },
      },
    },
    quiz: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          options: { type: "ARRAY", items: { type: "STRING" } },
          answer: { type: "STRING" },
        },
      },
    },
  },
  required: ["title", "summary", "jargon", "quiz"],
};

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

app.post("/api/generate-lesson", upload.single("file"), async (req, res) => {
  try {
    const { inputType } = req.body;
    let sourceText = "";

    // Handle PDF file upload if it exists
    if (req.file && inputType === "pdf") {
      const data = await pdf(req.file.buffer);
      sourceText = data.text;
    } else {
      // Handle other text-based inputs
      sourceText = req.body.data;
    }

    switch (inputType) {
      case "paste":
      case "pdf":
        // Text is already extracted
        break;
      case "youtube":
        const transcript = await YoutubeTranscript.fetchTranscript(sourceText);
        sourceText = transcript.map((t) => t.text).join(" ");
        break;
      case "url":
        const response = await axios.get(sourceText);
        const html = response.data;
        const $ = cheerio.load(html);
        sourceText = $("p").text();
        break;
      case "search":
        // This case remains special and doesn't use sourceText
        break;
      default:
        return res.status(400).json({ error: "Invalid input type" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });

    const instruction = `You are "Lumi," an expert educator. Your job is to create a complete "Lesson Kit" from the provided content. Analyze the content and return a JSON object that strictly follows the provided schema. The lesson should be clear, engaging, and accurate.
        
        - For 'search' requests, find the best information on the web to build the lesson.
        - For 'youtube' transcripts, the 'chapters' should be based on logical topic shifts.
        - For 'url' or 'paste', 'chapters' can be based on sections or key ideas.`;

    const generationConfig = {
      responseMimeType: "application/json",
      responseSchema: LESSON_KIT_SCHEMA,
    };

    let request;
    if (inputType === "search") {
      request = {
        contents: [
          {
            parts: [{ text: `Generate a lesson kit about: ${req.body.data}` }],
          },
        ],
        systemInstruction: { parts: [{ text: instruction }] },
        generationConfig,
        tools: [{ google_search: {} }],
      };
    } else {
      request = {
        contents: [
          {
            parts: [
              { text: `Here is the content to analyze:\n\n${sourceText}` },
            ],
          },
        ],
        systemInstruction: { parts: [{ text: instruction }] },
        generationConfig,
      };
    }

    const result = await model.generateContent(request);
    const lessonKit = JSON.parse(
      result.response.candidates[0].content.parts[0].text
    );

    res.json({ lessonKit, sourceText });
  } catch (error) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ error: "Failed to generate lesson" });
  }
});

app.post("/api/text-to-speech", async (req, res) => {
  try {
    const { text } = req.body;
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
      },
      {
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);
  } catch (error) {
    console.error("Error generating speech:", error);
    res.status(500).json({ error: "Failed to generate speech" });
  }
});

app.post("/api/chat-response", async (req, res) => {
  try {
    const { history, context } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-preview-09-2025",
    });

    const systemPrompt = `You are "Lumi," a friendly, patient, and encouraging study buddy. Your goal is to help the user practice the concepts from the lesson they just learned.
        
        Here is the full context of their lesson:
        ---
        ${context}
        ---
        
        Rules:
        - Use the provided chat history to understand the conversation.
        - Keep your responses short, conversational, and encouraging.
        - Do NOT just lecture. Ask open-ended questions to test their knowledge.
        - If they are wrong, gently correct them and guide them to the right answer.
        - Behave like a real, friendly human tutor.`;

    const chat = model.startChat({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      history,
    });

    const lastMessage = history[history.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);
    const responseText = result.response.candidates[0].content.parts[0].text;

    res.json({ text: responseText });
  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
