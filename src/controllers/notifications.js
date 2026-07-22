const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        actor: { select: { name: true, avatar: true } },
        sala: { select: { name: true } }
      },
      take: 50 // Limit to 50 latest
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.userId, read: false }
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener conteo de notificaciones' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.userId, read: false },
      data: { read: true }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al marcar notificaciones como leídas' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead
};
