const app = require("./app");

const PORT = process.env.PORT || 8080;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Estelar backend rodando na porta ${PORT}`);
});
