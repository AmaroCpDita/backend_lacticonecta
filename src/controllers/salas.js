const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getSalas = async (req, res) => {
  try {
    const salas = await prisma.sala.findMany({
      where: {
        approved: true
      }
    });
    // Parse the services JSON back to an array before sending
    const formattedSalas = salas.map(sala => ({
      ...sala,
      services: JSON.parse(sala.services)
    }));
    res.json(formattedSalas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las salas' });
  }
};

const getSalaById = async (req, res) => {
  const { id } = req.params;
  try {
    const sala = await prisma.sala.findUnique({
      where: { id: Number(id) },
      include: {
        salaReviews: {
          include: {
            author: {
              select: { id: true, name: true, avatar: true }
            },
            votes: true
          },
          orderBy: [
            { helpfulCount: 'desc' },
            { createdAt: 'desc' }
          ]
        }
      }
    });
    if (!sala) return res.status(404).json({ error: 'Sala no encontrada' });
    
    sala.services = JSON.parse(sala.services);
    res.json(sala);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la sala' });
  }
};

const createSala = async (req, res) => {
  try {
    const { name, address, lat, lng, description, image, services } = req.body;
    let userId = null;

    // Obtener userId si existe el token (sin fallar si no existe)
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.id;
      } catch (err) {
        // Token inválido o expirado, se ignora
      }
    }
    
    const newSala = await prisma.sala.create({
      data: {
        name,
        address,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        description,
        image,
        services: JSON.stringify(services || []),
        approved: true // AUTO APROBADO PARA PRUEBAS
      }
    });

    if (userId) {
      await prisma.notification.create({
        data: {
          type: 'system',
          content: '¡Felicidades! Tu sugerencia de sala ha sido aprobada y ahora es visible para todos.',
          userId: userId,
          salaId: newSala.id
        }
      });
    }
    
    res.status(201).json(newSala);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sugerir la sala' });
  }
};

const createReview = async (req, res) => {
  try {
    const salaId = parseInt(req.params.id);
    const { rating, content, cleanliness, privacy, comfort, equipment, accessibility } = req.body;
    const authorId = req.userId;

    // Guardar la reseña
    const newReview = await prisma.review.create({
      data: {
        rating,
        content,
        cleanliness,
        privacy,
        comfort,
        equipment,
        accessibility,
        authorId: Number(authorId),
        salaId
      }
    });

    // Recalcular el rating de la sala
    const aggregations = await prisma.review.aggregate({
      where: { salaId },
      _avg: { rating: true },
      _count: { id: true }
    });

    const newAvg = aggregations._avg.rating || 0;
    const newCount = aggregations._count.id || 0;

    // Actualizar la sala
    await prisma.sala.update({
      where: { id: salaId },
      data: {
        rating: newAvg,
        reviews: newCount
      }
    });

    // Dar 15 puntos al usuario por valorar una sala
    await prisma.user.update({
      where: { id: authorId },
      data: { points: { increment: 15 } }
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear reseña' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const salaId = parseInt(req.params.id);
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.userId;

    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    if (review.authorId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta reseña' });
    }

    await prisma.review.delete({ where: { id: reviewId } });

    // Recalcular el rating de la sala
    const aggregations = await prisma.review.aggregate({
      where: { salaId },
      _avg: { rating: true },
      _count: { id: true }
    });

    const newAvg = aggregations._avg.rating || 0;
    const newCount = aggregations._count.id || 0;

    await prisma.sala.update({
      where: { id: salaId },
      data: { rating: newAvg, reviews: newCount }
    });

    // Quitar los 15 puntos que se le dieron al crearla
    await prisma.user.update({
      where: { id: userId },
      data: { points: { decrement: 15 } }
    });

    res.json({ message: 'Reseña eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar reseña' });
  }
};

const voteReview = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const userId = req.userId;
    const { value } = req.body; // 1 or -1

    const existingVote = await prisma.reviewVote.findUnique({
      where: { userId_reviewId: { userId, reviewId } }
    });

    let helpfulCountChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off
        await prisma.reviewVote.delete({ where: { id: existingVote.id } });
        helpfulCountChange = value === 1 ? -1 : 1;
      } else {
        // Switch vote
        await prisma.reviewVote.update({
          where: { id: existingVote.id },
          data: { value }
        });
        helpfulCountChange = value === 1 ? 2 : -2;
      }
    } else {
      // New vote
      await prisma.reviewVote.create({
        data: { userId, reviewId, value }
      });
      helpfulCountChange = value;
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: helpfulCountChange } }
    });

    res.json({ success: true, message: 'Voto registrado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al votar la reseña' });
  }
};

const saveSala = async (req, res) => {
  try {
    const salaId = parseInt(req.params.id);
    const userId = req.userId;

    await prisma.savedSala.create({
      data: { userId, salaId }
    });
    res.json({ success: true, message: 'Sala guardada' });
  } catch (error) {
    // If it violates unique constraint, it's already saved, just ignore or return success
    if (error.code === 'P2002') {
      return res.json({ success: true, message: 'Sala ya estaba guardada' });
    }
    console.error(error);
    res.status(500).json({ error: 'Error al guardar sala' });
  }
};

const unsaveSala = async (req, res) => {
  try {
    const salaId = parseInt(req.params.id);
    const userId = req.userId;

    await prisma.savedSala.deleteMany({
      where: { userId, salaId }
    });
    res.json({ success: true, message: 'Sala eliminada de guardados' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar sala guardada' });
  }
};

module.exports = {
  getSalas,
  getSalaById,
  createSala,
  createReview,
  deleteReview,
  voteReview,
  saveSala,
  unsaveSala
};
