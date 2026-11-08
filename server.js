import "dotenv/config";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

function client() {
  if (!process.env.OPENAI_API_KEY) throw new Error("The app owner has not added an OPENAI_API_KEY yet.");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

app.get("/api/health", (_req, res) => res.json({ ok: true, configured: Boolean(process.env.OPENAI_API_KEY) }));

app.post("/api/chat", async (req, res) => {
  try {
    const { messages = [], fileText = "" } = req.body ?? {};
    if (!Array.isArray(messages) || messages.length === 0) return res.status(400).json({ error: "Send a message to begin." });
    const recent = messages.slice(-24).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 18000)
    }));
    if (fileText) recent[recent.length - 1].content += `\n\n[Uploaded file content]\n${String(fileText).slice(0, 30000)}`;
    const response = await client().responses.create({
      model: process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini",
      instructions: "You are AI.MALDIVES, a helpful, clear AI assistant. Be accurate, friendly, and transparent about uncertainty.",
      input: recent
    });
    res.json({ reply: response.output_text || "I couldn't create a text response. Please try again." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Chat request failed." });
  }
});

app.post("/api/image", async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || "").trim();
    if (!prompt) return res.status(400).json({ error: "Describe the image you want." });
    const result = await client().images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: prompt.slice(0, 4000),
      size: "1024x1024"
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) throw new Error("The image service returned no image.");
    res.json({ image: `data:image/png;base64,${b64}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Image generation failed." });
  }
});

app.post("/api/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Choose a file first." });
    const name = req.file.originalname.toLowerCase();
    let extracted = "";
    if (name.endsWith(".pdf")) {
      const data = await pdf(req.file.buffer);
      extracted = data.text;
    } else if (name.endsWith(".docx")) {
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      extracted = data.value;
    } else if (/\.(txt|md|csv|json|js|ts|py|html|css|xml|log)$/i.test(name)) {
      extracted = req.file.buffer.toString("utf8");
    } else {
      return res.status(415).json({ error: "Supported files: PDF, DOCX, TXT, MD, CSV, JSON, JS, TS, PY, HTML, CSS, XML and LOG." });
    }
    res.json({ name: req.file.originalname, text: extracted.slice(0, 30000), truncated: extracted.length > 30000 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Couldn't read this file. Try a text-based PDF or DOCX." });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`AI.MALDIVES is running at http://localhost:${port}`));
