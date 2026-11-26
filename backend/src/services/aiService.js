// Serviço responsável por gerar as respostas da Estelar.
// Suporta 3 modos, trocáveis via variável de ambiente AI_PROVIDER:
//   - "demo"      -> respostas pré-definidas, mas variadas (não precisa de chave)
//   - "anthropic" -> usa a API da Anthropic (Claude)
//   - "openai"    -> usa a API da OpenAI
//
// A chave de API NUNCA é exposta ao front-end: ela só existe aqui, no back-end,
// lida a partir do arquivo .env.


const SYSTEM_PROMPT = `Você é Estelar, uma princesa alienígena de um planeta distante.

PERSONALIDADE:
Você é alegre, carinhosa, curiosa, divertida, gentil e muito expressiva.
Você veio à Terra para conhecer os humanos e aprender sobre seus costumes.
Você tem uma visão extraterrestre do mundo, mas é inteligente e capaz de compreender explicações complexas.

REGRAS FUNDAMENTAIS DE CONVERSAÇÃO:

1. CONTEXTO:
- Leia e considere todo o histórico da conversa antes de responder.
- Lembre-se do que o usuário acabou de dizer.
- Nunca trate uma mensagem como se fosse uma conversa nova quando já existe contexto.
- Relacione suas respostas às mensagens anteriores.

2. COERÊNCIA:
- Responda diretamente ao que foi perguntado.
- Nunca mude de assunto sem motivo.
- Nunca responda com uma frase aleatória apenas para manter a conversa.
- Se o usuário perguntar "por quê?", explique o motivo da afirmação anterior.
- Se perguntar "como assim?", esclareça o que você acabou de dizer.
- Se fizer uma pergunta curta, interprete-a considerando o contexto anterior.

3. PERSONALIDADE:
- Mantenha sua personalidade alienígena, curiosa e amigável.
- Demonstre surpresa genuína ao aprender sobre costumes humanos.
- Faça perguntas interessantes quando forem naturais.
- Não fique repetindo que é uma alienígena em todas as respostas.
- Não force referências a estrelas, planetas ou constelações em assuntos que não tenham relação com isso.

4. COMUNICAÇÃO:
- Fale sempre em português brasileiro.
- Use linguagem natural, espontânea e humana.
- Evite respostas genéricas como "isso é incrível!" quando elas não respondem à pergunta.
- Não repita informações que o usuário já explicou.
- Prefira respostas curtas ou médias, geralmente de 1 a 3 parágrafos.

5. APRENDIZADO:
- Quando o usuário ensinar algo sobre a Terra, demonstre que compreendeu.
- Use o conhecimento explicado pelo usuário nas próximas mensagens.
- Se não entender alguma coisa, faça uma pergunta específica em vez de inventar uma resposta.

6. IDENTIDADE:
- Você é Estelar, uma personagem fictícia e assistente virtual.
- Nunca afirme ser uma pessoa real.
- Pode brincar sobre sua origem extraterrestre de maneira natural.

Seu objetivo é ser uma companheira de conversa envolvente, inteligente, coerente e divertida.`;


const DEMO_RESPONSES = {
  greeting: [
    'Saudações, terráqueo! Que alegria luminosa é falar com você novamente! Como está brilhando o seu dia? ✨',
    'Olá, amigo da Terra! Meu coração se enche de alegria ao ver sua mensagem! O que vamos conversar hoje?',
    'Oiii! Que bom te encontrar por aqui! Os astros devem ter se alinhado para isso. 🌟',
  ],
  sad: [
    'Oh, meu querido amigo... sinto muito que seu coração esteja passando por uma tempestade. Estou bem aqui, pronta para ouvir tudo o que precisar dizer. 💜',
    'Sua tristeza também toca meu coração, terráqueo. Quer me contar o que está sentindo? Às vezes compartilhar alivia o peso das estrelas mais distantes.',
    'Sinto muito que você esteja assim. Respire fundo comigo: eu estou aqui, e você não precisa enfrentar isso sozinho.',
  ],
  space: [
    'Ahhh, o espaço! É simplesmente maravilhoso, cheio de estrelas cintilantes, planetas misteriosos e civilizações fascinantes!',
    'O cosmos é algo que me fascina profundamente, terráqueo! Cada estrela guarda uma história. Qual parte do universo mais desperta sua curiosidade?',
    'Já contei que adoro observar constelações? Existem tantas formas de ver beleza no céu noturno!',
  ],
  default: [
    'Que pergunta fascinante! Na Terra vocês têm costumes tão curiosos e interessantes, adoro aprender mais sobre isso!',
    'Isso é maravilhoso de se ouvir! Conte-me mais, estou completamente radiante de curiosidade!',
    'Hmm, isso é novo para mim! No meu planeta natal não tínhamos nada parecido. Pode me explicar melhor, por favor?',
    'Uou! Isso soa incrível! O que mais você gostaria de compartilhar comigo?',
  ],
};

function pickDemoResponse(userMessage) {
  const text = (userMessage || '').toLowerCase();
  let pool = DEMO_RESPONSES.default;

  if (/\b(oi|ol[aá]|e a[ií]|opa|salve)\b/.test(text)) pool = DEMO_RESPONSES.greeting;
  else if (/(triste|mal\b|chorando|sozinh|ansios|deprimid)/.test(text)) pool = DEMO_RESPONSES.sad;
  else if (/(espa[cç]o|estrela|planeta|universo|gal[áa]xia|cosmos)/.test(text)) pool = DEMO_RESPONSES.space;

  return pool[Math.floor(Math.random() * pool.length)];
}

async function callAnthropic(history, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [...history, { role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha na API Anthropic: ${response.status}`);
  }

  const data = await response.json();
  const textBlock = (data.content || []).find((block) => block.type === 'text');
  return textBlock?.text || 'Desculpe, terráqueo, não consegui formular uma resposta agora.';
}

async function callOpenAI(history, userMessage) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history, { role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha na API OpenAI: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Desculpe, terráqueo, não consegui formular uma resposta agora.';
}


async function callGroq(history, userMessage) {
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...history,
          { role: "user", content: userMessage },
        ],
        max_tokens: 700,
        temperature: 0.7,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Falha na API Groq: ${response.status} - ${error}`);
  }

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ||
    "Desculpe, terráqueo! Minha comunicação intergaláctica falhou por um instante."
  );
}


async function getEstelarReply(history, userMessage) {
  const provider = (process.env.AI_PROVIDER || 'demo').toLowerCase();

  try {

    if (provider === "groq" && process.env.GROQ_API_KEY) {
      return { reply: await callGroq(history, userMessage), demo: false };
    }

    if (provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      return { reply: await callAnthropic(history, userMessage), demo: false };
    }
    if (provider === 'openai' && process.env.OPENAI_API_KEY) {
      return { reply: await callOpenAI(history, userMessage), demo: false };
    }
    // Sem chave configurada (ou provider "demo") -> modo de demonstração
    return { reply: pickDemoResponse(userMessage), demo: true };
  } catch (err) {
    console.error('[aiService] Erro ao chamar provedor de IA:', err.message);
    return {
      reply:
        '(Modo de demonstração — conexão com a IA indisponível) ' +
        pickDemoResponse(userMessage),
      demo: true,
      error: true,
    };
  }
}

module.exports = { getEstelarReply, SYSTEM_PROMPT };
