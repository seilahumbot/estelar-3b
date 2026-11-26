const app = require('./app');

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🌟 Servidor da Estelar rodando em http://localhost:${PORT}`);
});
