import { Plus, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import EstelarCharacter from './EstelarCharacter.jsx';

export default function Sidebar({ conversations, activeId, onSelect, onNew, onDelete }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <EstelarCharacter size={26} className="sidebar-character" />
        <span>Estelar</span>
      </div>

      <button className="btn-new-chat" onClick={onNew} type="button">
        <Plus size={18} /> Nova conversa
      </button>

      <div className="conversation-list">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conversation-item ${c.id === activeId ? 'active' : ''}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="conversation-title">{c.title}</span>
            <button
              className="icon-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              title="Excluir conversa"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="avatar-small">{user?.username?.[0]?.toUpperCase() || '?'}</div>
          <span>{user?.username}</span>
        </div>
        <button className="icon-btn" type="button" onClick={logout} title="Sair">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
