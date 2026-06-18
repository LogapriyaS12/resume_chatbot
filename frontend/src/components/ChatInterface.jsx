import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Plus, Bot, User, Loader2 } from 'lucide-react';
import { chatService } from '../services/api';

const ChatInterface = ({ resumeId }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "Tell me about this candidate.",
    "What are the candidate's technical skills?",
    "Explain the key work projects.",
    "What internships were completed?",
    "Is this candidate suitable for a Java Developer role?",
    "Identify candidate strengths and weaknesses."
  ];

  // Fetch past conversations on load
  useEffect(() => {
    if (resumeId) {
      loadConversations();
    }
  }, [resumeId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const data = await chatService.listConversations(resumeId);
      setConversations(data);
      if (data.length > 0 && !activeConversationId) {
        // Load the most recent conversation by default
        selectConversation(data[0].id);
      } else if (data.length === 0) {
        // Start a fresh empty state
        setMessages([]);
        setActiveConversationId(null);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  };

  const selectConversation = async (convId) => {
    setActiveConversationId(convId);
    try {
      const history = await chatService.getMessages(resumeId, convId);
      setMessages(history);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    // Optimistically add user message to UI
    const tempUserMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await chatService.sendMessage(resumeId, text, activeConversationId);
      
      // Update with exact backend history
      setMessages(response.history);
      
      // If a new conversation was created, reload list and select it
      if (!activeConversationId) {
        setActiveConversationId(response.conversation_id);
        await loadConversations();
        // Force highlight correct session
        setActiveConversationId(response.conversation_id);
      }
    } catch (err) {
      alert("Failed to get response: " + (err.response?.data?.detail || err.message));
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      gap: '16px'
    }}>
      {/* Sidebar for Conversations */}
      <div className="glass-panel" style={{
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        flexShrink: 0,
        background: 'rgba(13, 17, 28, 0.4)'
      }}>
        <button 
          className="btn btn-primary"
          onClick={startNewConversation}
          style={{
            width: '100%',
            marginBottom: '16px',
            fontSize: '0.85rem',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          New Chat
        </button>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', fontWeight: 600, paddingLeft: '4px', textTransform: 'uppercase' }}>
            Chat History
          </span>
          {conversations.length === 0 ? (
            <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem', paddingLeft: '4px', fontStyle: 'italic' }}>
              No chats yet.
            </p>
          ) : (
            conversations.map((conv, index) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv.id)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  background: activeConversationId === conv.id ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeConversationId === conv.id ? 'white' : 'hsl(var(--text-secondary))',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={14} style={{ flexShrink: 0 }} />
                <span>Session {conversations.length - index}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages Workspace */}
      <div className="glass-panel" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid hsl(var(--border-color))',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Bot size={20} style={{ color: 'hsl(var(--primary))' }} />
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>RAG Chat Assistant</h3>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
              Verifying against Resume Context
            </span>
          </div>
        </div>

        {/* Messages List */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              padding: '24px',
              color: 'hsl(var(--text-secondary))'
            }}>
              <Sparkles size={40} style={{ color: 'hsl(var(--primary))', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'white' }}>Ask anything about the candidate</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '400px', marginBottom: '24px', color: 'hsl(var(--text-muted))' }}>
                Gemini will answer queries strictly based on the uploaded resume text.
              </p>

              {/* Quick Prompts Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
                width: '100%',
                maxWidth: '500px'
              }}>
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSend(prompt)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid hsl(var(--border-color))',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: 'hsl(var(--text-secondary))',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'hsl(var(--primary))';
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'hsl(var(--border-color))';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: msg.role === 'user' ? 'hsl(var(--primary))' : 'hsl(var(--bg-surface-elevated))',
                    border: '1px solid hsl(var(--border-color))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {msg.role === 'user' ? <User size={14} color="white" /> : <Bot size={14} style={{ color: 'hsl(var(--secondary))' }} />}
                  </div>

                  {/* Bubble */}
                  <div style={{
                    background: msg.role === 'user' ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.8) 100%)' : 'hsl(var(--bg-surface-elevated))',
                    border: msg.role === 'user' ? 'none' : '1px solid hsl(var(--border-color))',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    fontSize: '0.9rem',
                    color: 'white',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'hsl(var(--bg-surface-elevated))',
                    border: '1px solid hsl(var(--border-color))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Bot size={14} style={{ color: 'hsl(var(--secondary))' }} />
                  </div>
                  <div style={{
                    background: 'hsl(var(--bg-surface-elevated))',
                    border: '1px solid hsl(var(--border-color))',
                    padding: '12px 16px',
                    borderRadius: '4px 16px 16px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Loader2 size={16} className="spinner" style={{ color: 'hsl(var(--text-muted))' }} />
                    <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Searching resume and analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid hsl(var(--border-color))',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              display: 'flex',
              gap: '10px'
            }}
          >
            <input
              type="text"
              className="form-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask a question about the candidate's experience, suitability, projects..."
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !inputMessage.trim()}
              style={{ padding: '12px 16px', borderRadius: '10px' }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
