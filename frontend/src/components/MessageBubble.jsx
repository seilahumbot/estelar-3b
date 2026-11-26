import { motion } from 'framer-motion';

export default function MessageBubble({ role, content, createdAt }) {
  const isUser = role === 'user';
  const time = createdAt
    ? new Date(createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`message-row ${isUser ? 'from-user' : 'from-estelar'}`}
    >
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'estelar-bubble'}`}>
        <p>{content}</p>
        {time && <span className="message-time">{time}</span>}
      </div>
    </motion.div>
  );
}
