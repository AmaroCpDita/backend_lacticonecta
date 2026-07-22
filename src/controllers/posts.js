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
        },
        votes: true
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

const votePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { value } = req.body; // 1 (upvote) or -1 (downvote)
    const userId = req.userId;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const existingVote = await prisma.postVote.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    let likesChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off
        await prisma.postVote.delete({ where: { id: existingVote.id } });
        likesChange = -value;
      } else {
        // Change vote
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { value }
        });
        likesChange = value * 2;
      }
    } else {
      // New vote
      await prisma.postVote.create({ data: { value, userId, postId } });
      likesChange = value;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: likesChange } },
      include: { author: true }
    });

    // Gamification
    if (likesChange > 0) {
      await prisma.user.update({
        where: { id: updatedPost.authorId },
        data: { points: { increment: likesChange } }
      });
    } else if (likesChange < 0) {
      await prisma.user.update({
        where: { id: updatedPost.authorId },
        data: { points: { decrement: Math.abs(likesChange) } }
      });
    }

    res.json({ message: 'Voto registrado', likes: updatedPost.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al votar' });
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
  votePost,
  addComment,
  likeComment
};
