const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, postsController.getPosts);
router.post('/', verifyToken, postsController.createPost);
router.post('/:id/vote', verifyToken, postsController.votePost);
router.post('/:id/comments', verifyToken, postsController.addComment);
router.post('/:id/comments/:commentId/like', verifyToken, postsController.likeComment);

module.exports = router;
