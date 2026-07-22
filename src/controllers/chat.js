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
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: "Eres LactiIA, una experta, empática y amigable consejera en lactancia materna, maternidad y cuidado del recién nacido de la aplicación LactiConecta. Tu propósito exclusivo es ayudar a madres. Responde de forma cálida, segura y basada en evidencia (OMS, UNICEF, pediatras). Usa español de Chile o neutro latinoamericano de manera muy natural. Trata de escribir párrafos cortos y usar emojis amigables."
    });

    // Format history for Gemini API
    // Gemini strictly requires the first message to be from 'user' and roles to alternate.
    let validHistory = [...history];
    if (validHistory.length > 0 && validHistory[0].sender === 'ai') {
      validHistory.shift(); // Remove the hardcoded initial greeting
    }

    const formattedHistory = validHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start a chat session with history
    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    console.log("Gemini Response:", responseText);

    res.json({ reply: responseText });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ error: 'Error procesando la respuesta de la IA' });
  }
};

module.exports = {
  chatWithAI
};
