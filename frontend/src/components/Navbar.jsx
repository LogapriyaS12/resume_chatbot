import React from 'react';
import { FileText, Sparkles, Home } from 'lucide-react';

const Navbar = ({ activeCandidateName, onBackToDashboard }) => {
  return (
    <header className="glass-panel" style={{
      borderRadius: '0 0 16px 16px',
      borderTop: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '24px',
      padding: '16px 24px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1350px',
        margin: '0 auto'
      }}>
        {/* Logo and Brand */}
        <div 
          onClick={onBackToDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%)',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px hsl(var(--primary) / 0.3)'
          }}>
            <Sparkles size={20} color="white" />
          </div>
          <span className="gradient-text" style={{
            fontFamily: 'Outfit',
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '-0.02em'
          }}>
            AI Resume Assistant
          </span>
        </div>

        {/* Dynamic Context Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {activeCandidateName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid hsl(var(--border-color))',
              fontSize: '0.85rem'
            }}>
              <FileText size={14} style={{ color: 'hsl(var(--secondary))' }} />
              <span style={{ color: 'hsl(var(--text-muted))' }}>Active:</span>
              <strong style={{ color: 'hsl(var(--text-primary))' }}>{activeCandidateName}</strong>
            </div>
          )}

          <button 
            className="btn btn-secondary" 
            onClick={onBackToDashboard}
            style={{
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem'
            }}
          >
            <Home size={16} />
            Dashboard
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
