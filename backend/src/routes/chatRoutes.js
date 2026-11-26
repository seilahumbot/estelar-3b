const { Router } = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const {
  listConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteConversation,
} = require('../controllers/chatController');

const router = Router();
router.use(authMiddleware);

router.get('/conversations', asyncHandler(listConversations));
router.post('/conversations', asyncHandler(createConversation));
router.get('/conversations/:id', asyncHandler(getMessages));
router.post('/conversations/:id/messages', asyncHandler(sendMessage));
router.delete('/conversations/:id', asyncHandler(deleteConversation));

module.exports = router;
