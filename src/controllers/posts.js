const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: { select: { id: true, name: true, avatar: true, verified: true, points: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true, verified: true, points: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los posts' });
  }
};

const createPost = async (req, res) => {
  try {
    const { title, content, tag } = req.body;
    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        tag: tag || 'General',
        authorId: req.userId
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, verified: true, points: true } },
        comments: true
      }
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el post' });
  }
};

const likePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
      include: { author: true }
    });
    
    // Opcional: darle puntos al autor del post por el like recibido
    await prisma.user.update({
      where: { id: post.authorId },
      data: { points: { increment: 1 } }
    });

    res.json({ message: 'Like registrado', likes: post.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al dar like' });
  }
};

const addComment = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { content } = req.body;
    
    const newComment = await prisma.comment.create({
      data: {
        content,
        authorId: req.userId,
        postId: postId
      },
      include: {
        author: { select: { id: true, name: true, avatar: true, verified: true, points: true } }
      }
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al comentar' });
  }
};

const likeComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { likes: { increment: 1 } }
    });
    
    // Gamificación: Dar 1 punto al autor del comentario
    await prisma.user.update({
      where: { id: comment.authorId },
      data: { points: { increment: 1 } }
    });

    res.json({ message: 'Like en comentario registrado', likes: comment.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al dar like al comentario' });
  }
};

module.exports = {
  getPosts,
  createPost,
  likePost,
  addComment,
  likeComment
};
