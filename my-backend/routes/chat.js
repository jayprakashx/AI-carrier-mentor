const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

router.post("/", async (req, res) => {
  try {
    const { message, imageBase64, mimeType } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "GEMINI_API_KEY missing in backend .env" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const parts = [{ text: message }];

    // Optional image support
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/png"
        }
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }]
    });

    const reply = result?.response?.text() || "";
    return res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err?.message || err);
    return res.status(500).json({ reply: "AI error" });
  }
});

module.exports = router;