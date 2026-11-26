const prisma = require('../config/prisma');
const { getEstelarReply } = require('../services/aiService');

async function listConversations(req, res) {
  const conversations = await prisma.conversation.findMany({
    where: { userId: req.userId },
    orderBy: { updatedAt: 'desc' },
  });
  return res.json({ conversations });
}

async function createConversation(req, res) {
  const conversation = await prisma.conversation.create({
    data: { userId: req.userId, title: 'Nova conversa' },
  });
  return res.status(201).json({ conversation });
}

async function getMessages(req, res) {
  const { id } = req.params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: req.userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada.' });
  }
  return res.json({ conversation });
}

async function sendMessage(req, res) {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'A mensagem não pode estar vazia.' });
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: req.userId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada.' });
  }

  await prisma.message.create({
    data: { conversationId: id, role: 'user', content: content.trim() },
  });

  const history = conversation.messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const { reply, demo } = await getEstelarReply(history, content.trim());

  const assistantMessage = await prisma.message.create({
    data: { conversationId: id, role: 'assistant', content: reply },
  });

  const isFirstMessage = conversation.messages.length === 0;
  await prisma.conversation.update({
    where: { id },
    data: {
      updatedAt: new Date(),
      ...(isFirstMessage ? { title: content.trim().slice(0, 40) } : {}),
    },
  });

  return res.status(201).json({ message: assistantMessage, demo });
}

async function deleteConversation(req, res) {
  const { id } = req.params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: req.userId },
  });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversa não encontrada.' });
  }
  await prisma.conversation.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  listConversations,
  createConversation,
  getMessages,
  sendMessage,
  deleteConversation,
};
