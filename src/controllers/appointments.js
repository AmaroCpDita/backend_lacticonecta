const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

// Servicio de Zoom Simulado
// En producción, esto llamaría a la API de Zoom (Server-to-Server OAuth)
const createZoomMeeting = async (topic, date) => {
  // Simulamos una llamada HTTP de 1 segundo a la API de Zoom
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generamos un ID de reunión falso pero creíble
  const meetingId = Math.floor(1000000000 + Math.random() * 9000000000);
  const password = crypto.randomBytes(4).toString('hex');
  
  return {
    join_url: `https://zoom.us/j/${meetingId}?pwd=${password}`,
    meeting_id: meetingId,
    password: password
  };
};

const getAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las citas' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { date, topic } = req.body;
    
    // 1. Generar Link de Zoom (simulado por ahora)
    const zoomData = await createZoomMeeting(topic, date);

    // 2. Guardar en Base de Datos
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(date),
        topic,
        zoomLink: zoomData.join_url,
        userId: req.userId
      }
    });

    res.status(201).json({
      message: 'Cita agendada exitosamente',
      appointment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al agendar videollamada' });
  }
};

module.exports = {
  getAppointments,
  createAppointment
};
