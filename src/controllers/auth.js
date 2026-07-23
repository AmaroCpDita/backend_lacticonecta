const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretlacticonecta2026';

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name) + '&background=random'
      }
    });

    // Generar token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      token,
      user: { 
        id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar,
        points: newUser.points, verified: newUser.verified, bio: newUser.bio,
        _count: { followers: 0, following: 0 }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        _count: { select: { followers: true, following: true } }
      }
    });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { 
        id: user.id, name: user.name, email: user.email, avatar: user.avatar,
        points: user.points, verified: user.verified, bio: user.bio,
        _count: user._count
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

const me = async (req, res) => {
  try {
    // El middleware auth pasará userId
    const user = await prisma.user.findUnique({ 
      where: { id: req.userId },
      include: {
        _count: { select: { followers: true, following: true } }
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ 
      id: user.id, name: user.name, email: user.email, avatar: user.avatar,
      points: user.points, verified: user.verified, bio: user.bio,
      _count: user._count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

module.exports = {
  register,
  login,
  me
};
