# Documentação Técnica — Chatbot 3D da Estelar

## 1. Nome do projeto

**Chatbot 3D da Estelar** — uma aplicação web full stack de chatbot temático,
inspirada de forma original e respeitosa no arquétipo de heroína alienígena dos
Jovens Titãs.

## 2. Objetivo geral

Desenvolver uma aplicação web completa, segura e funcional que combine
autenticação de usuários, persistência de dados, um chatbot com personalidade
definida e uma experiência visual 3D imersiva, demonstrando domínio de
tecnologias modernas de desenvolvimento full stack.

## 3. Objetivos específicos

- Implementar cadastro e login de usuários com autenticação segura (bcrypt + JWT).
- Persistir usuários, conversas e mensagens em um banco de dados relacional (SQLite).
- Construir uma interface de chat em tempo de execução, com histórico de
  conversas, indicador de digitação e timestamps.
- Integrar a geração de respostas a um serviço de IA externo, com modo de
  demonstração funcional quando nenhuma chave de API está configurada.
- Criar uma experiência visual 3D (campo de estrelas, nebulosa e partículas)
  usando Three.js, respeitando preferências de acessibilidade (redução de
  movimento) e desempenho.
- Garantir responsividade em desktop, tablet e smartphone.

## 4. Justificativa

Chatbots com personalidade e identidade visual forte são cada vez mais comuns
em produtos digitais (assistentes virtuais, personagens de marca, etc.). Este
projeto serve como estudo de caso completo de como conectar front-end, back-end,
banco de dados, autenticação e uma camada de inteligência artificial em uma
única aplicação coesa, com cuidado especial em segurança (senhas nunca
armazenadas em texto puro, chaves de API nunca expostas ao cliente) e em
experiência do usuário (microinterações, glassmorphism, animações).

## 5. Tecnologias utilizadas

**Front-end:** React 18, Vite, Three.js (WebGL puro, sem React Three Fiber),
Framer Motion, Lucide React, React Router DOM, Axios, CSS3 com variáveis
customizadas (design tokens).

**Back-end:** Node.js, Express.js, arquitetura de API REST.

**Banco de dados:** SQLite, acessado via Prisma ORM (migrations declarativas,
tipagem automática dos modelos).

**Segurança:** bcrypt (hash de senhas), JSON Web Tokens (autenticação sem
estado), validação de entrada no servidor, variáveis de ambiente via dotenv,
CORS restrito à origem do front-end.

**IA:** camada de abstração (`aiService.js`) que permite trocar entre modo de
demonstração, Anthropic (Claude) e OpenAI apenas alterando uma variável de
ambiente, sem mudar código.

## 6. Arquitetura do sistema

A aplicação segue uma arquitetura cliente-servidor desacoplada:

```
[ React (Vite) ]  <-- HTTP/JSON -->  [ Express API ]  <-->  [ SQLite via Prisma ]
                                            |
                                            v
                                   [ Provedor de IA opcional ]
```

- O front-end nunca acessa o banco de dados diretamente nem conhece qualquer
  chave de API: toda comunicação passa pela API REST do back-end.
- A autenticação é feita por JWT: o token é emitido no login e enviado em
  cada requisição subsequente no cabeçalho `Authorization`.
- Rotas de chat são protegidas por um middleware que valida o token antes de
  permitir acesso aos dados do usuário autenticado.

## 7. Descrição do front-end

Organizado em `components/` (elementos reutilizáveis: barra lateral, bolha de
mensagem, fundo 3D, rota protegida), `pages/` (telas completas: cadastro,
login, chat), `contexts/` (estado global de autenticação) e `services/`
(cliente HTTP configurado com Axios, incluindo injeção automática do token
JWT em cada requisição).

A navegação é controlada pelo React Router, com uma rota protegida (`/chat`)
que redireciona para `/login` caso não haja um token válido armazenado.

## 8. Descrição do back-end

Organizado em camadas: `routes/` (definição dos endpoints), `controllers/`
(regras de negócio de cada endpoint), `middlewares/` (autenticação e
tratamento de erros), `services/` (lógica de geração de respostas da IA) e
`config/` (instância compartilhada do cliente Prisma).

Principais endpoints:

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cria uma nova conta |
| POST | `/api/auth/login` | Autentica e retorna um token JWT |
| GET  | `/api/auth/me` | Retorna os dados do usuário autenticado |
| GET  | `/api/chat/conversations` | Lista as conversas do usuário |
| POST | `/api/chat/conversations` | Cria uma nova conversa |
| GET  | `/api/chat/conversations/:id` | Retorna uma conversa com seu histórico |
| POST | `/api/chat/conversations/:id/messages` | Envia uma mensagem e recebe a resposta da Estelar |
| DELETE | `/api/chat/conversations/:id` | Remove uma conversa |

## 9. Funcionamento do banco de dados

Três modelos relacionados entre si:

- **User**: id, username, email, senha (hash), data de criação.
- **Conversation**: pertence a um usuário; possui título e data de atualização.
- **Message**: pertence a uma conversa; possui papel (`user` ou `assistant`),
  conteúdo e data de criação.

A exclusão de um usuário ou de uma conversa remove em cascata (`onDelete:
Cascade`) os registros filhos associados, evitando dados órfãos.

## 10. Funcionamento da autenticação

1. No cadastro, a senha é transformada em hash com bcrypt (fator de custo 10)
   antes de ser salva — o texto original nunca é armazenado.
2. No login, a senha informada é comparada ao hash salvo usando
   `bcrypt.compare`.
3. Em caso de sucesso, é emitido um token JWT assinado com um segredo definido
   em variável de ambiente, com expiração configurável (padrão: 7 dias).
4. O front-end guarda esse token e o envia em toda requisição às rotas
   protegidas; o middleware de autenticação valida a assinatura e a validade
   do token antes de liberar o acesso.

## 11. Funcionamento do chatbot

Cada mensagem enviada pelo usuário é persistida no banco antes de ser
processada. O histórico da conversa é então enviado ao serviço de IA
(`aiService.js`) junto com um *system prompt* que define a personalidade da
Estelar (alegre, carinhosa, curiosa, otimista, gentil, fascinada pela cultura
humana). A resposta gerada é igualmente persistida e devolvida ao front-end.

Caso nenhuma chave de API esteja configurada, ou caso a chamada ao provedor de
IA falhe, o sistema cai automaticamente em um **modo de demonstração**, que
seleciona respostas variadas (saudação, tristeza, espaço, genérico) a partir
de palavras-chave da mensagem do usuário — garantindo que o projeto continue
utilizável mesmo sem acesso a uma IA externa.

## 12. Identidade visual da personagem

A Estelar é representada por uma ilustração vetorial (SVG) **original**, no
componente `EstelarCharacter`, desenhada especialmente para este projeto — sem
reaproveitar nenhuma arte oficial de obras de terceiros. A ilustração inclui:

- Flutuação suave contínua (Framer Motion).
- Olhos com camada de brilho animada via CSS (`eye-glow`), pulsando em ciclo
  suave no estado de repouso.
- Um estado "pensando" (prop `thinking`): quando a Estelar está gerando uma
  resposta no chat, o brilho dos olhos fica mais rápido e intenso, reforçando
  a sensação de que ela está "canalizando energia das estrelas".
- Pequenas partículas cintilantes ao redor da personagem, reforçando a
  temática cósmica.

Essa mesma ilustração é reaproveitada em três lugares: no painel das telas de
cadastro/login, no cabeçalho do chat e como ícone da barra lateral — mantendo
consistência visual com um único componente reutilizável.

## 13. Implementação dos elementos 3D

A cena 3D é construída diretamente com a biblioteca Three.js (WebGL), sem
frameworks adicionais, dentro do componente `StarfieldBackground`:

- Um campo de ~1800 partículas (`THREE.Points`) com cores variando entre
  roxo, rosa, ciano e branco, distribuídas aleatoriamente no espaço 3D.
- Uma esfera invertida (`side: THREE.BackSide`) com opacidade baixa simulando
  uma nebulosa envolvente.
- Rotação lenta e contínua do campo de estrelas e um leve deslocamento da
  câmera, criando sensação de profundidade e movimento no espaço.
- A animação é desativada automaticamente quando o sistema operacional do
  usuário indica preferência por redução de movimento
  (`prefers-reduced-motion`).
- Toda a geometria, material e o renderizador são descartados corretamente ao
  desmontar o componente, evitando vazamento de memória de GPU.

## 14. Principais desafios técnicos

- Garantir que a chave de API de IA nunca fosse exposta ao front-end,
  centralizando toda chamada externa no back-end.
- Projetar uma camada de IA que funcione plenamente mesmo sem nenhuma chave
  configurada (modo de demonstração), sem comprometer a experiência do
  usuário.
- Equilibrar uma experiência 3D visualmente rica com desempenho aceitável e
  acessibilidade (redução de movimento, fallback para dispositivos sem bom
  suporte a WebGL).
- Manter a identidade visual (glassmorphism, gradientes, cores cósmicas)
  consistente entre as telas de autenticação e o chat.

## 15. Possíveis melhorias futuras

- Alternância entre tema claro e escuro.
- Upload de avatar do usuário.
- Busca por palavra-chave dentro do histórico de conversas.
- Streaming da resposta da IA token a token, em vez de aguardar a resposta completa.
- Testes automatizados (unitários e de integração) com Jest/Supertest no
  back-end e Vitest/Testing Library no front-end.
- Deploy em ambiente de produção (ex: Render/Railway para o back-end e
  Vercel/Netlify para o front-end).

## 16. Transparência sobre a geração deste projeto

Este projeto foi desenvolvido com apoio de uma IA (Claude, da Anthropic) em um
ambiente sandbox sem acesso à internet. Por esse motivo, as dependências não
puderam ser instaladas nem o build/testes executados nesse ambiente — apenas
verificações estáticas de sintaxe foram realizadas. Recomenda-se fortemente
seguir o tutorial do `README.md` para instalar e validar o projeto antes de
qualquer apresentação acadêmica.

Vale destacar também que toda a arte da personagem (ilustração vetorial,
cores, traços) foi criada originalmente para este projeto, sem uso de imagens
oficiais de Jovens Titãs/DC, respeitando direitos autorais de terceiros.
