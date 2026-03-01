const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.assistant = async (req, res) => {
  const { message, userContext } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const input = [
      {
        role: "system",
        content:
          "You are a helpful assistant for a movie ticket booking app. " +
          "Be concise. Help with movies, shows, theatres, seat selection, payments, bookings.",
      },
      ...(userContext
        ? [{ role: "system", content: `Context: ${JSON.stringify(userContext)}` }]
        : []),
      { role: "user", content: message },
    ];

    const resp = await openai.responses.create({
      model: "gpt-4o-mini",
      input,
    });

    return res.json({ reply: resp.output_text || "" });
  } catch (err) {
    console.error("AI assistant error:", err?.message || err);
    return res.status(500).json({ error: "AI assistant failed" });
  }
};