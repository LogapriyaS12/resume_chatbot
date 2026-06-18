import React, { useState } from 'react';
import { FileText, Calendar, ArrowRight, Trash2, Loader2 } from 'lucide-react';

const ResumeCard = ({ resume, onSelect, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = async (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the candidate profile for "${resume.filename}"? This will delete all chat history and matches.`)) {
      setIsDeleting(true);
      try {
        await onDelete(resume.id);
      } catch (err) {
        alert('Failed to delete resume: ' + err.message);
        setIsDeleting(false);
      }
    }
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      className="glass-panel" 
      onClick={() => onSelect(resume.id)}
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '180px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid hsl(var(--border-color))',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 10px 0 hsl(var(--primary-glow))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'hsl(var(--border-color))';
        e.currentTarget.style.boxShadow = '0 8px 32px 0 rgba(0, 0, 0, 0.4)';
      }}
    >
      {/* Absolute background glow */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '100px',
        height: '100px',
        background: 'hsl(var(--primary) / 0.1)',
        filter: 'blur(40px)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <div>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            background: 'hsl(var(--bg-surface-elevated))',
            padding: '8px',
            borderRadius: '8px',
            color: 'hsl(var(--secondary))',
            border: '1px solid hsl(var(--border-color))'
          }}>
            <FileText size={20} />
          </div>
          
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'hsl(var(--text-muted))',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'hsl(var(--danger))';
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'hsl(var(--text-muted))';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {isDeleting ? <Loader2 size={16} className="spinner" /> : <Trash2 size={16} />}
          </button>
        </div>

        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          marginBottom: '6px',
          maxWidth: '240px'
        }}>
          {resume.filename}
        </h3>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'hsl(var(--text-muted))',
          fontSize: '0.8rem'
        }}>
          <Calendar size={12} />
          <span>Uploaded {formatDate(resume.created_at)}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid hsl(var(--border-color))',
        paddingTop: '12px',
        marginTop: '12px'
      }}>
        <span style={{ fontSize: '0.85rem', color: 'hsl(var(--primary))', fontWeight: 600 }}>
          View Interview Profile
        </span>
        <ArrowRight size={16} style={{ color: 'hsl(var(--primary))' }} />
      </div>
    </div>
  );
};

export default ResumeCard;
