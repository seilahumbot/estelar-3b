import { useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar.jsx';
import MessageBubble from '../components/MessageBubble.jsx';
import StarfieldBackground from '../three/StarfieldBackground.jsx';
import EstelarCharacter from '../components/EstelarCharacter.jsx';
import api from '../services/api.js';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Olá, terráqueo! Eu sou Estelar! Estou muito feliz por conhecer você! Como está seu dia? Podemos conversar sobre qualquer coisa!',
  createdAt: new Date().toISOString(),
};

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  async function loadConversations() {
    setLoadingConversations(true);
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data.conversations);
      if (data.conversations.length > 0) {
        await selectConversation(data.conversations[0].id);
      } else {
        await handleNewConversation();
      }
    } finally {
      setLoadingConversations(false);
    }
  }

  async function selectConversation(id) {
    setActiveId(id);
    const { data } = await api.get(`/chat/conversations/${id}`);
    setMessages(data.conversation.messages.length > 0 ? data.conversation.messages : [WELCOME_MESSAGE]);
  }

  async function handleNewConversation() {
    const { data } = await api.post('/chat/conversations');
    setConversations((prev) => [data.conversation, ...prev]);
    setActiveId(data.conversation.id);
    setMessages([WELCOME_MESSAGE]);
  }

  async function handleDeleteConversation(id) {
    await api.delete(`/chat/conversations/${id}`);
    const remaining = conversations.filter((c) => c.id !== id);
    setConversations(remaining);
    if (id === activeId) {
      if (remaining.length > 0) await selectConversation(remaining[0].id);
      else await handleNewConversation();
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || !activeId || sending) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setTyping(true);

    try {
      const { data } = await api.post(`/chat/conversations/${activeId}/messages`, { content: text });
      setMessages((prev) => [...prev, data.message]);
      loadConversationsList();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Ops! Perdi o sinal com as estrelas por um instante. Pode tentar novamente?',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
      setTyping(false);
    }
  }

  async function loadConversationsList() {
    const { data } = await api.get('/chat/conversations');
    setConversations(data.conversations);
  }

  return (
    <div className="chat-page">
      <StarfieldBackground />
      {!loadingConversations && (
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
        />
      )}

      <main className="chat-main glass">
        <header className="chat-header">
          <EstelarCharacter size={52} thinking={typing} className="avatar-header" />
          <div>
            <h2>Estelar</h2>
            <span className="status online">
              {typing ? '✨ Canalizando energia das estrelas...' : '● Online, no espaço sideral'}
            </span>
          </div>
        </header>

        <div className="messages-area">
          {messages.map((m) => (
            <MessageBubble key={m.id} role={m.role} content={m.content} createdAt={m.createdAt} />
          ))}
          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="typing-indicator">
              <span />
              <span />
              <span />
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="message-input-area" onSubmit={handleSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Converse com a Estelar..."
            disabled={sending}
          />
          <button type="submit" className="btn-send" disabled={sending || !input.trim()}>
            {sending ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
          </button>
        </form>
      </main>
    </div>
  );
}
