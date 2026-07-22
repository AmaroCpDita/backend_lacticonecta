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
        salaReviews: true
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
    
    res.status(201).json(newSala);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al sugerir la sala' });
  }
};

const createReview = async (req, res) => {
  try {
    const salaId = parseInt(req.params.id);
    const { rating, content, authorId } = req.body;

    // Guardar la reseña
    const newReview = await prisma.review.create({
      data: {
        rating,
        content,
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

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear reseña' });
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
  saveSala,
  unsaveSala
};
