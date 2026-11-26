# 🌟 Chatbot 3D da Estelar — Projeto Acadêmico Full Stack

Projeto fictício e original, inspirado de forma livre e respeitosa no arquétipo de
heroína alienígena dos Jovens Titãs. Não usa nenhuma imagem, modelo 3D ou texto
oficial da obra — toda a identidade visual e a personalidade da "Estelar" aqui
foram criadas do zero para fins acadêmicos.

> ⚠️ **Importante sobre este material**: este projeto foi gerado por uma IA em um
> ambiente sem acesso à internet. Isso significa que **as dependências NÃO foram
> instaladas, o build NÃO foi executado e os testes automatizados NÃO foram
> rodados** nesse ambiente — apenas a sintaxe de cada arquivo foi verificada
> estaticamente (`node --check` no back-end e `esbuild` no front-end, todos sem
> erros). Siga o tutorial abaixo na sua máquina para instalar, rodar e testar de
> verdade. Se encontrar algum erro durante a instalação, normalmente é só uma
> versão de pacote desatualizada — veja a seção de solução de problemas no final.

---

## 1. O que você vai precisar instalar

1. **Node.js** (versão 18 ou superior) — [https://nodejs.org](https://nodejs.org)
   - Baixe a versão "LTS", instale normalmente (Next, Next, Finish).
   - Para confirmar que instalou, abra o terminal e digite: `node --version`
2. **Visual Studio Code** — [https://code.visualstudio.com](https://code.visualstudio.com)
3. Um navegador atualizado (Chrome, Edge ou Firefox).

Não é necessário instalar nenhum banco de dados separado: o projeto usa **SQLite**,
que é um arquivo local criado automaticamente.

---

## 2. Baixando e abrindo o projeto

1. Extraia o arquivo `estelar-chatbot-3d.zip` em uma pasta de sua preferência.
2. Abra o **VS Code**.
3. Vá em `Arquivo > Abrir Pasta...` e selecione a pasta `estelar-chatbot-3d`.
4. Abra o terminal integrado do VS Code: menu `Terminal > Novo Terminal`.

A estrutura de pastas é:

```
estelar-chatbot-3d/
├── backend/           -> API em Node.js + Express + Prisma
├── frontend/
│   └── src/
│       ├── components/     -> EstelarCharacter, Sidebar, MessageBubble, ProtectedRoute
│       ├── three/           -> StarfieldBackground (cena 3D)
│       ├── pages/           -> Login, Register, Chat
│       ├── contexts/        -> AuthContext
│       ├── services/        -> cliente HTTP (api.js)
│       └── styles/          -> globals.css, auth.css, chat.css, character.css
├── README.md
└── DOCUMENTACAO.md
```

> Sobre a personagem: as "imagens da Estelar" usadas no projeto são uma
> **ilustração vetorial (SVG) 100% original**, criada especialmente para este
> projeto — não reproduz nenhuma arte oficial de Jovens Titãs/DC. Os olhos
> dela brilham de verdade (animação em CSS) e ficam ainda mais intensos
> enquanto ela está "pensando" na resposta do chat.

---

## 3. Configurando e rodando o BACK-END

No terminal do VS Code:

```bash
cd backend
npm install
```

Agora copie o arquivo de variáveis de ambiente de exemplo:

```bash
cp .env.example .env
```

(No Windows, se `cp` não funcionar, copie e cole o arquivo manualmente pelo
Explorador de Arquivos, ou use `copy .env.example .env` no PowerShell/CMD.)

Abra o arquivo `.env` recém-criado e, se quiser, ajuste o `JWT_SECRET` para
qualquer texto aleatório grande. Por padrão, `AI_PROVIDER="demo"` — assim o
chatbot já funciona sem nenhuma chave de API (veja a seção 6 para usar IA real).

Agora crie o banco de dados SQLite e as tabelas:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Isso vai criar um arquivo `backend/prisma/dev.db` com as tabelas de usuários,
conversas e mensagens.

Por fim, inicie o servidor:

```bash
npm run dev
```

Se tudo deu certo, você verá no terminal algo como:

```
🌟 Servidor da Estelar rodando em http://localhost:3333
```

Deixe esse terminal aberto e rodando.

---

## 4. Configurando e rodando o FRONT-END

Abra um **segundo terminal** no VS Code (ícone de "+" no painel de terminal) e
rode:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O terminal vai mostrar um endereço parecido com:

```
Local:   http://localhost:5173/
```

---

## 5. Acessando o sistema

1. Abra o navegador em **http://localhost:5173**
2. Você verá a tela de **cadastro**. Crie uma conta com usuário, e-mail e senha
   (mínimo 8 caracteres, com letras e números).
3. Após cadastrar, você será levado para a tela de **login**. Entre com o
   e-mail e a senha cadastrados.
4. Você será redirecionado para o **chat com a Estelar** — pode conversar
   normalmente! Em modo de demonstração (sem chave de IA), as respostas são
   variadas, mas não usam um modelo de linguagem real.

---

## 6. (Opcional) Ligando uma IA de verdade

Por padrão o projeto funciona em **modo de demonstração**, sem precisar de
nenhuma chave de API. Se quiser respostas geradas por IA de verdade:

1. Abra `backend/.env`
2. Escolha um provedor:
   - Para usar a **Anthropic (Claude)**: defina `AI_PROVIDER="anthropic"` e
     cole sua chave em `ANTHROPIC_API_KEY`.
   - Para usar a **OpenAI**: defina `AI_PROVIDER="openai"` e cole sua chave em
     `OPENAI_API_KEY`.
3. Salve o arquivo e reinicie o servidor do back-end (`Ctrl+C` no terminal e
   rode `npm run dev` novamente).

**Nunca compartilhe sua chave de API publicamente** (ex: no GitHub). O arquivo
`.env` já está no `.gitignore` para evitar isso.

---

## 7. Testando as funcionalidades principais

Um roteiro simples de testes manuais que você pode seguir:

- [ ] Cadastrar uma nova conta (deve dar certo).
- [ ] Tentar cadastrar com o mesmo e-mail de novo (deve dar erro "já existe uma conta").
- [ ] Tentar cadastrar com senhas diferentes no campo "confirmar senha" (deve bloquear).
- [ ] Fazer login com e-mail/senha corretos (deve entrar no chat).
- [ ] Fazer login com senha errada (deve mostrar erro, sem travar a tela).
- [ ] Enviar uma mensagem para a Estelar e receber uma resposta.
- [ ] Criar uma nova conversa pelo botão "Nova conversa".
- [ ] Fechar a aba, abrir de novo e ver se o histórico de conversas continua lá.
- [ ] Excluir uma conversa.
- [ ] Clicar em "Sair" e confirmar que não é mais possível acessar `/chat`
      sem logar de novo.
- [ ] Redimensionar a janela (ou abrir pelo celular) para ver o layout responsivo.

---

## 8. Build de produção (opcional)

Para gerar uma versão otimizada do front-end:

```bash
cd frontend
npm run build
npm run preview
```

Para rodar o back-end em modo produção:

```bash
cd backend
npm start
```

---

## 9. Solução de problemas comuns

| Problema | Possível causa / solução |
|---|---|
| `npm install` falha | Verifique sua conexão com a internet e a versão do Node (`node --version`, precisa ser 18+). |
| Erro de CORS no navegador | Confirme que `FRONTEND_URL` no `.env` do backend é `http://localhost:5173` e que o backend está rodando. |
| "Erro ao conectar com o servidor" no front-end | Verifique se o backend está rodando na porta 3333 e se `VITE_API_URL` no `.env` do frontend aponta para `http://localhost:3333/api`. |
| Erro do Prisma dizendo que a tabela não existe | Rode novamente `npx prisma migrate dev --name init` dentro da pasta `backend`. |
| Tela preta ou sem estrelas 3D | Seu navegador/placa de vídeo pode não suportar WebGL; o restante da interface continua funcionando normalmente. |
| Quero recomeçar o banco do zero | Apague o arquivo `backend/prisma/dev.db` e rode de novo `npx prisma migrate dev --name init`. |

---

## 10. Limitações conhecidas / transparência

- O ambiente onde este projeto foi gerado não tinha acesso à internet, então
  **as dependências não puderam ser baixadas e nenhum teste automatizado foi
  executado aqui**. O código foi revisado manualmente e teve sua sintaxe
  verificada (`node --check` e `esbuild`), mas é fundamental que você rode os
  passos acima na sua máquina e confira se tudo funciona como esperado.
- O modo "demo" da IA usa respostas pré-definidas com variação, não um modelo
  de linguagem real — é um substituto funcional para quando não há chave de
  API configurada.
- Não há modelo 3D exclusivo da personagem (GLB/GLTF licenciado); em vez disso,
  foi criado um ambiente 3D original com campo de estrelas, nebulosa e
  partículas usando Three.js puro.
