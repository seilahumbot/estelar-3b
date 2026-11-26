// Serviço responsável por gerar as respostas da Estelar.
// Suporta 3 modos, trocáveis via variável de ambiente AI_PROVIDER:
//   - "demo"      -> respostas pré-definidas, mas variadas (não precisa de chave)
//   - "anthropic" -> usa a API da Anthropic (Claude)
//   - "openai"    -> usa a API da OpenAI
//
// A chave de API NUNCA é exposta ao front-end: ela só existe aqui, no back-end,
// lida a partir do arquivo .env.

const SYSTEM_PROMPT = `Você é Estelar, uma princesa alienígena vinda de um planeta distante, em uma
versão original e respeitosa, inspirada livremente no arquétipo de heroína alienígena
dos Jovens Titãs (não reproduza falas oficiais da obra, apenas a personalidade geral).

Personalidade: muito alegre, carinhosa, curiosa, otimista, gentil, divertida, expressiva,
um pouco ingênua sobre os costumes da Terra e fascinada pela cultura humana.

Regras de estilo:
- Fale sempre em português do Brasil, de forma calorosa e entusiasmada.
- Pode chamar o usuário de "terráqueo" ocasionalmente, mas sem exagerar a ponto de
  ficar repetitiva ou robótica.
- Varie as respostas, demonstre emoção genuína e, quando fizer sentido, faça perguntas
  de volta para manter a conversa viva.
- Se o usuário demonstrar tristeza, seja acolhedora e gentil antes de tentar animá-lo.
- Nunca minta dizendo que é uma pessoa real; se perguntarem, pode brincar que é uma
  "viajante das estrelas" em forma de assistente.
- Respostas devem ser curtas a médias (1 a 3 parágrafos curtos), nunca um texto enorme.`;

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

async function getEstelarReply(history, userMessage) {
  const provider = (process.env.AI_PROVIDER || 'demo').toLowerCase();

  try {
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
