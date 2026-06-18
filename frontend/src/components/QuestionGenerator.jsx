import React, { useState, useEffect } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Code2, Heart, Award, Cpu, Loader2 } from 'lucide-react';
import { interviewService } from '../services/api';

const QuestionGenerator = ({ resumeId }) => {
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('technical');
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    if (resumeId) {
      fetchQuestions();
    }
  }, [resumeId]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setQuestions(null);
    setRevealedAnswers({});
    try {
      const data = await interviewService.getQuestions(resumeId);
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load interview questions", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (index) => {
    setRevealedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const categories = [
    { id: 'technical', name: 'Technical', icon: <Cpu size={16} /> },
    { id: 'hr', name: 'HR / Behavioral', icon: <Heart size={16} /> },
    { id: 'project_based', name: 'Project-Based', icon: <Award size={16} /> },
    { id: 'coding', name: 'Coding Challenges', icon: <Code2 size={16} /> }
  ];

  const getActiveList = () => {
    if (!questions) return [];
    if (activeCategory === 'technical') return questions.technical || [];
    if (activeCategory === 'hr') return questions.hr || [];
    if (activeCategory === 'project_based') return questions.project_based || [];
    if (activeCategory === 'coding') return questions.coding || [];
    return [];
  };

  const activeList = getActiveList();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid hsl(var(--border-color))',
        background: 'rgba(255, 255, 255, 0.02)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              flex: 1,
              minWidth: '100px',
              padding: '14px 10px',
              border: 'none',
              background: activeCategory === cat.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              color: activeCategory === cat.id ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              borderBottom: activeCategory === cat.id ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {cat.icon}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 4px 16px 0' }}>
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '16px' }}>
            <Loader2 size={36} className="spinner" style={{ color: 'hsl(var(--primary))' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px' }}>Compiling Mock Interview...</h3>
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>Generating candidate-specific questions using Gemini LLM</p>
            </div>
          </div>
        )}

        {!isLoading && !questions && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <HelpCircle size={40} style={{ color: 'hsl(var(--text-muted))' }} />
            <button className="btn btn-primary" onClick={fetchQuestions}>
              Generate Mock Interview Questions
            </button>
          </div>
        )}

        {!isLoading && questions && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>
                Found {activeList.length} customized questions
              </span>
              <button 
                onClick={fetchQuestions}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'hsl(var(--primary))',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                Regenerate Set
              </button>
            </div>

            {activeList.map((item, idx) => {
              const itemKey = `${activeCategory}_${idx}`;
              const isOpen = !!revealedAnswers[itemKey];

              return (
                <div 
                  key={idx}
                  className="glass-panel"
                  style={{
                    background: isOpen ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid hsl(var(--border-color))',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Accordion Header */}
                  <div 
                    onClick={() => toggleAnswer(itemKey)}
                    style={{
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: 'hsl(var(--bg-surface-elevated))',
                        color: 'hsl(var(--text-secondary))',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid hsl(var(--border-color))',
                        flexShrink: 0,
                        height: '22px',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        Q{idx + 1}
                      </span>
                      <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', lineHeight: '1.4' }}>
                        {item.question}
                      </p>
                    </div>
                    <div style={{ color: 'hsl(var(--text-muted))', flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderTop: '1px solid hsl(var(--border-color))',
                      fontSize: '0.9rem',
                      lineHeight: '1.6'
                    }}>
                      <strong style={{ color: 'hsl(var(--secondary))', display: 'block', marginBottom: '8px' }}>
                        {activeCategory === 'coding' ? 'Solution:' : 'Suggested Answer:'}
                      </strong>
                      
                      {activeCategory === 'coding' ? (
                        <pre style={{
                          background: 'hsl(var(--bg-surface))',
                          padding: '14px',
                          borderRadius: '8px',
                          border: '1px solid hsl(var(--border-color))',
                          overflowX: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#e2e8f0',
                          whiteSpace: 'pre-wrap'
                        }}>
                          <code>{item.solution || item.answer}</code>
                        </pre>
                      ) : (
                        <p style={{ color: 'hsl(var(--text-secondary))', whiteSpace: 'pre-wrap' }}>
                          {item.answer}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionGenerator;
