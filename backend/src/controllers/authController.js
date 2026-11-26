const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePassword(password) {
  return (
    typeof password === 'string' &&
    password.length >= 8 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

async function register(req, res) {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }
  if (username.trim().length < 3) {
    return res.status(400).json({ error: 'O nome de usuário deve ter ao menos 3 caracteres.' });
  }
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }
  if (!validatePassword(password)) {
    return res
      .status(400)
      .json({ error: 'A senha deve ter ao menos 8 caracteres, incluindo letras e números.' });
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return res.status(409).json({ error: 'Já existe uma conta com este e-mail ou nome de usuário.' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username: username.trim(), email: email.trim().toLowerCase(), password: hashedPassword },
    select: { id: true, username: true, email: true, createdAt: true },
  });

  return res.status(201).json({ message: 'Conta criada com sucesso!', user });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha.' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  }

  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  return res.json({
    message: 'Login realizado com sucesso!',
    token,
    user: { id: user.id, username: user.username, email: user.email },
  });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, username: true, email: true, createdAt: true },
  });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
  return res.json({ user });
}

module.exports = { register, login, me };
