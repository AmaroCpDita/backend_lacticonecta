const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    let updateData = {};
    
    if (name) updateData.name = name;
    
    if (req.file) {
      // Si se subió un archivo, crear la URL de la imagen
      const imageUrl = `http://localhost:3000/uploads/${req.file.filename}`;
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

module.exports = {
  updateProfile
};
