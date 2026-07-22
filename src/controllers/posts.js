const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, tag, authorId } = req.body;
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        tag: tag || 'General',
        authorId: Number(authorId)
      },
      include: {
        author: true
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el post' });
  }
};

module.exports = {
  getPosts,
  createPost
};
