// Core Node.js modules
const path = require("path");
const fs = require("fs");

// Load environment variables first
const envPath = path.join(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
require("dotenv").config({ path: envPath });

// Debug: Print sanitized keys (first few chars only)
const debugKey = (key) => key ? `${key.slice(0, 8)}...` : 'undefined';
console.log('Loaded API Keys:', {
  GEMINI_API_KEY: debugKey(process.env.GEMINI_API_KEY),
  ELEVENLABS_API_KEY: debugKey(process.env.ELEVENLABS_API_KEY)
});

// Third-party dependencies
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const { YoutubeTranscript } = require("youtube-transcript");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const multer = require("multer");
const pdf = require("pdf-parse");

// API Key Validation Helpers
const validateGeminiKey = async (key) => {
  if (!key) return { valid: false, error: "Key is empty" };
  if (!key.startsWith("AIza")) return { valid: false, error: "Invalid format (should start with 'AIza')" };
  
  try {
    const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Test connection.");
    return { valid: true };
  } catch (err) {
    return { 
      valid: false, 
      error: err.message || "Failed to validate with Gemini API"
    };
  }
};

const validateElevenLabsKey = async (key) => {
  if (!key) return { valid: false, error: "Key is empty" };
  if (!key.startsWith("sk_")) return { valid: false, error: "Invalid format (should start with 'sk_')" };
  
  try {
    const response = await axios.get("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key }
    });
    return { valid: true };
  } catch (err) {
    return { 
      valid: false, 
      error: err.response?.data?.detail || err.message || "Failed to validate with ElevenLabs API"
    };
  }
};

// pdfjs for a different text-extraction strategy
let pdfjsLib;
try {
  pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
} catch (e) {
  console.warn("pdfjs-dist not available; pdfjs fallback will be disabled.", e && e.message);
}
// tesseract.js for OCR fallback (scanned PDFs)
let createWorker;
try {
  ({ createWorker } = require("tesseract.js"));
} catch (e) {
  console.warn("tesseract.js not available; OCR fallback will be disabled.", e && e.message);
}

const app = express();
// Helper to sanitize env values (trim, remove surrounding quotes and BOM)
const sanitizeEnv = (v) => {
  if (typeof v !== "string") return v;
  // Remove BOM if present
  if (v.charCodeAt(0) === 0xfeff) v = v.slice(1);
  v = v.trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  return v;
};

const port = sanitizeEnv(process.env.PORT) || 3001;

// Sanitize and validate API keys
const GEMINI_API_KEY = sanitizeEnv(process.env.GEMINI_API_KEY);
const ELEVENLABS_API_KEY = sanitizeEnv(process.env.ELEVENLABS_API_KEY);

if (!GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set. Generative AI features will fail until configured.");
}

if (!ELEVENLABS_API_KEY) {
  console.warn("Warning: ELEVENLABS_API_KEY is not set. Text-to-speech will fail until configured.");
}

let genAI;
try {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY ? GEMINI_API_KEY : process.env.GEMINI_API_KEY);
} catch (err) {
  console.error("Failed to initialize GoogleGenerativeAI:", err && err.message ? err.message : err);
  // Keep server running; endpoint handlers will return clearer errors if genAI is missing
  genAI = null;
}

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

// Ensure uploads directory exists for temporary OCR files
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper: extract text using pdfjs-dist
async function extractWithPdfJs(buffer) {
  if (!pdfjsLib) throw new Error("pdfjs-dist not installed");
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const pdfDoc = await loadingTask.promise;
  let fullText = "";
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((it) => it.str).join(" ");
    fullText += pageText + "\n";
  }
  return fullText;
}

// Helper: perform OCR using tesseract.js on a saved file
async function extractWithTesseract(filePath) {
  if (!createWorker) throw new Error("tesseract.js not installed");
  const worker = createWorker({
    logger: () => {}, // silence or provide progress if desired
  });
  try {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(filePath);
    return data && data.text ? data.text : "";
  } finally {
    try { await worker.terminate(); } catch (e) { /* ignore */ }
  }
}

app.get("/", (req, res) => {
  res.json({ status: "Server is running" });
});

app.post("/api/generate-lesson", upload.single("file"), async (req, res) => {
  try {
    const { inputType } = req.body;
    let sourceText = "";

    // Handle PDF file upload if it exists
    if (req.file && inputType === "pdf") {
      try {
        // Basic sanity checks
        if (!req.file.buffer || req.file.buffer.length < 100) {
          return res.status(400).json({ error: "Uploaded file is empty or too small to be a valid PDF." });
        }

        const data = await pdf(req.file.buffer);
        if (!data || !data.text) {
          return res.status(400).json({ error: "Failed to extract text from PDF. The file may be corrupted or encrypted." });
        }
        sourceText = data.text;
      } catch (pdfErr) {
        console.error("PDF parse error:", pdfErr && pdfErr.message ? pdfErr.message : pdfErr);
        return res.status(400).json({ error: "PDF parsing failed. Ensure you uploaded a valid, unencrypted PDF." });
      }
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

    if (!genAI) return res.status(500).json({ error: "Generative AI not configured (missing GEMINI_API_KEY)." });

    if (!genAI) return res.status(500).json({ error: "Generative AI not configured (missing GEMINI_API_KEY)." });

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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
        tools: [{ google_search_retrieval: {} }],
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
    // Defensive parsing: the model should return JSON text, but guard against unexpected outputs
    const rawText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      console.error("Empty response from generative model", { result });
      return res.status(500).json({ error: "Empty response from generative model." });
    }

    let lessonKit;
    try {
      lessonKit = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Failed to parse model output as JSON:", parseErr && parseErr.message ? parseErr.message : parseErr, { rawText });
      return res.status(500).json({ error: "Generative model returned invalid JSON." });
    }

    res.json({ lessonKit, sourceText });
  } catch (error) {
    console.error("Error generating lesson:", error);
    res.status(500).json({ error: "Failed to generate lesson" });
  }
});

// Debug endpoint: tries multiple strategies to extract text from an uploaded PDF
app.post("/api/debug-pdf", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const tempName = `upload-${Date.now()}.pdf`;
  const tempPath = path.join(uploadDir, tempName);
  try {
    // Save to disk for OCR fallback
    fs.writeFileSync(tempPath, req.file.buffer);

    const attempts = [];

    // 1) Try pdf-parse
    try {
      const data = await pdf(req.file.buffer);
      if (data && data.text && data.text.trim().length > 0) {
        return res.json({ method: "pdf-parse", length: data.text.length, sample: data.text.slice(0, 1000) });
      }
      attempts.push({ method: "pdf-parse", note: "empty text" });
    } catch (e) {
      attempts.push({ method: "pdf-parse", error: e.message });
    }

    // 2) Try pdfjs-dist
    try {
      const text = await extractWithPdfJs(req.file.buffer);
      if (text && text.trim().length > 0) {
        return res.json({ method: "pdfjs", length: text.length, sample: text.slice(0, 1000) });
      }
      attempts.push({ method: "pdfjs", note: "empty text" });
    } catch (e) {
      attempts.push({ method: "pdfjs", error: e.message });
    }

    // 3) Try OCR (tesseract)
    try {
      const ocrText = await extractWithTesseract(tempPath);
      if (ocrText && ocrText.trim().length > 0) {
        return res.json({ method: "tesseract", length: ocrText.length, sample: ocrText.slice(0, 1000) });
      }
      attempts.push({ method: "tesseract", note: "empty text" });
    } catch (e) {
      attempts.push({ method: "tesseract", error: e.message });
    }

    return res.status(400).json({ error: "All parsers failed to extract text", attempts });
  } finally {
    // Clean up temporary file
    try { if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }
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
            "xi-api-key": ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY,
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
      model: "gemini-1.5-flash",
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
    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      console.error("Empty chat response from generative model", { result });
      return res.status(500).json({ error: "Empty response from generative model." });
    }

    res.json({ text: responseText });
  } catch (error) {
    console.error("Error generating chat response:", error);
    res.status(500).json({ error: "Failed to generate chat response" });
  }
});

// Enhanced startup validation
const validateStartup = async () => {
  console.log("\nValidating API keys...");
  
  // Test Gemini key
  const geminiResult = await validateGeminiKey(GEMINI_API_KEY);
  if (!geminiResult.valid) {
    console.error(`❌ GEMINI_API_KEY validation failed: ${geminiResult.error}`);
    console.log("  → Get a valid key from: https://makersuite.google.com/app/apikey");
  } else {
    console.log("✓ GEMINI_API_KEY validated successfully");
  }
  
  // Test ElevenLabs key
  const elevenResult = await validateElevenLabsKey(ELEVENLABS_API_KEY);
  if (!elevenResult.valid) {
    console.error(`❌ ELEVENLABS_API_KEY validation failed: ${elevenResult.error}`);
    console.log("  → Get a valid key from: https://elevenlabs.io/ (Profile Settings)");
  } else {
    console.log("✓ ELEVENLABS_API_KEY validated successfully");
  }
  
  console.log(""); // Empty line for readability
};

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  await validateStartup();
});
