const fs = require('fs');

const postsControllerPath = 'src/controllers/posts.js';
let content = fs.readFileSync(postsControllerPath, 'utf8');

content = content.replace(
  'votes: true // Include votes so we know the score and if the current user voted', 
  'votes: true'
);

if (!content.includes('votes: true')) {
  content = content.replace(
    'orderBy: { createdAt: \\'asc\\' }\\n        }',
    'orderBy: { createdAt: \\'asc\\' }\\n        },\\n        votes: true'
  );
}

const likePostRegex = /const likePost = async \\(req, res\\) => \\{[\\s\\S]*?\\};/m;

const votePostCode = \const votePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { value } = req.body; // should be 1 or -1
    const userId = req.userId;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'El valor del voto debe ser 1 o -1' });
    }

    const existingVote = await prisma.postVote.findUnique({
      where: {
        userId_postId: { userId, postId }
      }
    });

    let likesChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Eliminar el voto (toggle off)
        await prisma.postVote.delete({
          where: { id: existingVote.id }
        });
        likesChange = -value;
      } else {
        // Cambiar el voto (de upvote a downvote o viceversa)
        await prisma.postVote.update({
          where: { id: existingVote.id },
          data: { value }
        });
        likesChange = value * 2;
      }
    } else {
      // Crear nuevo voto
      await prisma.postVote.create({
        data: { value, userId, postId }
      });
      likesChange = value;
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { likes: { increment: likesChange } },
      include: { author: true }
    });

    // Opcional: gamificación
    if (likesChange > 0) {
      await prisma.user.update({
        where: { id: updatedPost.authorId },
        data: { points: { increment: likesChange } }
      });
    } else if (likesChange < 0) {
      // No restamos puntos para no desmotivar demasiado en el prototipo, pero podríamos
      await prisma.user.update({
        where: { id: updatedPost.authorId },
        data: { points: { decrement: Math.abs(likesChange) } }
      });
    }

    res.json({ message: 'Voto registrado', likes: updatedPost.likes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar el voto' });
  }
};\;

content = content.replace(likePostRegex, votePostCode);
content = content.replace('likePost,', 'votePost,');

fs.writeFileSync(postsControllerPath, content, 'utf8');
console.log('Posts controller updated');

