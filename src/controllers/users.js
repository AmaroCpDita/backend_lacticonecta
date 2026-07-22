const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    let updateData = {};
    
    if (name) updateData.name = name;
    
    if (req.file) {
      // Devolver una ruta relativa que funcione en cualquier entorno
      const imageUrl = `/uploads/${req.file.filename}`;
      updateData.avatar = imageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: updateData
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, avatar: updatedUser.avatar }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const profileId = parseInt(req.params.id);
    const profile = await prisma.user.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        name: true,
        avatar: true,
        verified: true,
        points: true,
        createdAt: true,
        posts: {
          include: { author: { select: { id: true, name: true, avatar: true, verified: true, points: true } }, comments: true },
          orderBy: { createdAt: 'desc' }
        },
        followers: { select: { id: true } },
        following: { select: { id: true } }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener perfil público' });
  }
};

const followUser = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const myUserId = req.userId;

    if (targetUserId === myUserId) {
      return res.status(400).json({ error: 'No puedes seguirte a ti mismo' });
    }

    // Comprobar si ya lo sigo
    const me = await prisma.user.findUnique({
      where: { id: myUserId },
      include: { following: { select: { id: true } } }
    });

    const isFollowing = me.following.some(u => u.id === targetUserId);

    if (isFollowing) {
      // Dejar de seguir
      await prisma.user.update({
        where: { id: myUserId },
        data: { following: { disconnect: { id: targetUserId } } }
      });
      res.json({ message: 'Has dejado de seguir a este usuario', following: false });
    } else {
      // Seguir
      await prisma.user.update({
        where: { id: myUserId },
        data: { following: { connect: { id: targetUserId } } }
      });
      res.json({ message: 'Ahora sigues a este usuario', following: true });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar seguimiento' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        verified: true,
        points: true,
        createdAt: true,
        _count: {
          select: { followers: true, following: true, posts: true }
        },
        posts: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const users = await prisma.user.findMany({
      where: {
        name: { contains: q }
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        verified: true,
        points: true
      },
      take: 10
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar usuarios' });
  }
};

module.exports = {
  updateProfile,
  getProfile,
  getPublicProfile,
  followUser,
  searchUsers
};
