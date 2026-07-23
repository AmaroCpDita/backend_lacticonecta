const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const WELCOME_MESSAGE = '¡Hola! Soy Latti, tu consejera de lactancia. ¿En qué te puedo ayudar hoy?';

// Get all chats for the authenticated user
const getChats = async (req, res) => {
  try {
    const chats = await prisma.aiChat.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only last message for preview
        }
      }
    });
    res.json(chats);
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ error: 'Error al obtener los chats' });
  }
};

// Get all messages for a specific chat
const getChatMessages = async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes' });
  }
};

// Create a new chat
const createChat = async (req, res) => {
  try {
    const chat = await prisma.aiChat.create({
      data: {
        userId: req.user.id,
        messages: {
          create: {
            text: WELCOME_MESSAGE,
            sender: 'ai',
            emotion: 'NEUTRAL'
          }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    res.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ error: 'Error al crear el chat' });
  }
};

// Delete a chat
const deleteChat = async (req, res) => {
  try {
    const chatId = parseInt(req.params.id);
    
    // Verify ownership
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId: req.user.id }
    });
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    await prisma.aiChat.delete({ where: { id: chatId } });
    res.json({ message: 'Chat eliminado' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Error al eliminar el chat' });
  }
};

// Send a message and get AI response
const chatWithAI = async (req, res) => {
  try {
    const { message, chatId, userName = 'Amiga' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'El mensaje es requerido' });
    }

    if (!chatId) {
      return res.status(400).json({ error: 'El chatId es requerido' });
    }

    // Verify chat ownership
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId: req.user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chat) {
      return res.status(404).json({ error: 'Chat no encontrado' });
    }

    // Save the user's message to DB
    await prisma.aiMessage.create({
      data: { text: message, sender: 'user', chatId }
    });

    // Prepare model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: `Eres Latti, una experta, empática y amigable consejera en lactancia materna, maternidad y cuidado del recién nacido de la aplicación LactiConecta. Tu propósito exclusivo es ayudar a madres. Responde de forma cálida, segura y basada en evidencia (OMS, UNICEF, pediatras). Usa español de Chile o neutro latinoamericano de manera muy natural. Trata de escribir párrafos cortos y usar emojis amigables.
      
      ESTRICTO: La usuaria con la que hablas se llama ${userName}. Llámala siempre por su nombre de forma cariñosa.
      ESTRICTO: Siempre, siempre, SIEMPRE debes comenzar TODAS tus respuestas con una etiqueta que defina tu emoción actual. Las únicas etiquetas válidas son: [NEUTRAL], [PENSANDO], [RESPONDIENDO], [EMPATIA], [ERROR], [CONFUSO], [FELICITACION], [CANSADO], [ALERTA], [CURIOSO], [INSPIRADO], [DIVERTIDO], [ABRAZO], [EXPERTA], [NOCTURNO], [ZEN], [ORGULLO], [TERNURA], [ANALIZANDO], [EMERGENCIA]. 
      ESTRICTO: Si la usuaria reporta una emergencia médica o que su bebé está en peligro, NUNCA uses [ALERTA]. Responde SIEMPRE usando [EMERGENCIA] para brindarle apoyo emocional inmediato.
      Ejemplo de respuesta válida: "[EMPATIA] ¡Hola ${userName}! Entiendo perfectamente lo que sientes..."`
    });

    // Build history from DB messages (skip the welcome message)
    let dbMessages = chat.messages.filter(m => !(m.sender === 'ai' && m.text === WELCOME_MESSAGE && chat.messages.indexOf(m) === 0));
    // Ensure first message is from user
    if (dbMessages.length > 0 && dbMessages[0].sender === 'ai') {
      dbMessages.shift();
    }

    const formattedHistory = dbMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Start a chat session with history
    const aiChat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        temperature: 0.7,
      },
    });

    const result = await aiChat.sendMessage(message);
    const responseText = result.response.text();

    console.log("Gemini Response:", responseText);

    // Parse emotion from response
    let cleanText = responseText;
    let emotion = 'NEUTRAL';
    const emotionMatch = responseText.match(/^\[([A-Z]+)\]\s*/);
    if (emotionMatch) {
      emotion = emotionMatch[1];
      cleanText = responseText.replace(emotionMatch[0], '');
    }

    // Save AI response to DB
    await prisma.aiMessage.create({
      data: { text: cleanText, sender: 'ai', emotion, chatId }
    });

    // Auto-generate title from first user message
    if (chat.title === 'Nuevo Chat') {
      const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      await prisma.aiChat.update({
        where: { id: chatId },
        data: { title }
      });
    }

    // Touch updatedAt
    await prisma.aiChat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    });

    res.json({ reply: responseText, emotion });
  } catch (error) {
    console.error('Error in chatWithAI:', error);
    res.status(500).json({ error: 'Error procesando la respuesta de la IA' });
  }
};

module.exports = {
  getChats,
  getChatMessages,
  createChat,
  deleteChat,
  chatWithAI
};
