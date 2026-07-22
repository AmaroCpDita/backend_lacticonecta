const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format history for Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start a chat session with history
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    // System instructions are passed as context in the first message if needed, 
    // or we can just prepend it to the current message if it's the first turn.
    let prompt = message;
    if (history.length === 0) {
      prompt = `Eres LactiIA, una asistente experta, empática y amigable en lactancia materna, maternidad y cuidado del recién nacido. Responde de forma cálida, segura, concisa y basada en evidencia (OMS, UNICEF, pediatras). Habla en español de Chile o neutro latinoamericano de manera natural.\n\nPregunta de la madre: ${message}`;
    }

    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ error: 'Error procesando la respuesta de la IA' });
  }
};

module.exports = {
  chatWithAI
};
