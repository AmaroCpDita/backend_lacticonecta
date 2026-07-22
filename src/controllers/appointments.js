const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

// Obtener Access Token de Zoom
const getZoomAccessToken = async () => {
  try {
    console.log("CLIENT_ID length:", ZOOM_CLIENT_ID ? ZOOM_CLIENT_ID.length : 'undefined');
    console.log("CLIENT_SECRET length:", ZOOM_CLIENT_SECRET ? ZOOM_CLIENT_SECRET.length : 'undefined');
    console.log("ACCOUNT_ID length:", ZOOM_ACCOUNT_ID ? ZOOM_ACCOUNT_ID.length : 'undefined');
    
    const authHeader = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error de Zoom Auth: ${data.error} - ${data.reason}`);
    }
    return data.access_token;
  } catch (error) {
    console.error('Error al obtener token de Zoom:', error);
    throw error;
  }
};

// Crear Reunión de Zoom
const createZoomMeeting = async (topic, startTime) => {
  try {
    const accessToken = await getZoomAccessToken();
    
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: startTime,
        duration: 45,
        timezone: 'America/Santiago',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true
        }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(`Error creando reunión de Zoom: ${data.message}`);
    }
    
    return {
      join_url: data.join_url,
      meeting_id: data.id,
      password: data.password
    };
  } catch (error) {
    console.error('Error al crear reunión en Zoom:', error);
    throw error;
  }
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
    
    // 1. Crear Reunión Real en Zoom
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
    res.status(500).json({ error: 'Error al agendar videollamada. Verifica que la App de Zoom esté activada.' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    
    // Verificar que la cita pertenezca al usuario
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });

    if (!appointment || appointment.userId !== req.userId) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    await prisma.appointment.delete({
      where: { id: appointmentId }
    });

    res.json({ message: 'Cita cancelada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cancelar la cita' });
  }
};

module.exports = {
  getAppointments,
  createAppointment,
  deleteAppointment
};
