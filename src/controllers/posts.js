const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getPosts = async (req, res) => {
  try {
    const feed = req.query.feed || 'parati';
    const userId = req.userId;

    let whereClause = {};
    let orderByClause = { createdAt: 'desc' };

    if (feed === 'parati') {
      orderByClause = { likes: 'desc' };
    } else if (feed === 'recientes') {
      orderByClause = { createdAt: 'desc' };
    } else if (feed === 'siguiendo' && userId) {
      // Get the user's following list
      const me = await prisma.user.findUnique({
        where: { id: userId },
        include: { following: { select: { id: true } } }
      });
      const followingIds = me?.following?.map(u => u.id) || [];
      if (followingIds.length === 0) {
        return res.json({ posts: [], noFollowing: true });
      }
      whereClause = { authorId: { in: followingIds } };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
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
      orderBy: orderByClause
    });
    res.json(feed === 'siguiendo' ? { posts, noFollowing: false } : posts);
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

    // Gamification & Notification
    if (likesChange > 0) {
      await prisma.user.update({
        where: { id: updatedPost.authorId },
        data: { points: { increment: likesChange } }
      });
      
      // Notificación de Like
      if (updatedPost.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'like',
            content: `le dio me gusta a tu publicación "${updatedPost.title}".`,
            userId: updatedPost.authorId,
            actorId: userId,
            postId: postId
          }
        });
      }
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
        author: { select: { id: true, name: true, avatar: true, verified: true, points: true } },
        post: { select: { authorId: true, title: true } }
      }
    });

    // Notificación de Comentario
    if (newComment.post.authorId !== req.userId) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          content: `comentó tu publicación "${newComment.post.title}".`,
          userId: newComment.post.authorId,
          actorId: req.userId,
          postId: postId
        }
      });
    }

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

const deletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id: postId } });
    
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    
    if (post.authorId !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este post' });
    }

    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: 'Post eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el post' });
  }
};

module.exports = {
  getPosts,
  createPost,
  votePost,
  addComment,
  likeComment,
  deletePost
};
