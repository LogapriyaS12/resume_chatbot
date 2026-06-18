import React, { useState, useEffect } from 'react';
import { Briefcase, CheckCircle, AlertTriangle, Play, Sparkles, Loader2, History } from 'lucide-react';
import { jdService } from '../services/api';

const JDMatcher = ({ resumeId }) => {
  const [jdText, setJdText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('match'); // match, history

  useEffect(() => {
    if (resumeId) {
      loadHistory();
    }
  }, [resumeId]);

  const loadHistory = async () => {
    try {
      const data = await jdService.getMatches(resumeId);
      setHistory(data);
    } catch (err) {
      console.error("Failed to load match history", err);
    }
  };

  const handleMatch = async () => {
    if (!jdText.trim() || isLoading) return;

    setIsLoading(true);
    setMatchResult(null);

    try {
      const result = await jdService.matchJD(resumeId, jdText);
      setMatchResult(result);
      await loadHistory();
    } catch (err) {
      alert("JD matching failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getPercentageColor = (pct) => {
    if (pct >= 80) return 'hsl(var(--success))';
    if (pct >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid hsl(var(--border-color))',
        marginBottom: '16px'
      }}>
        <button
          onClick={() => setActiveTab('match')}
          style={{
            padding: '12px 16px',
            border: 'none',
            background: activeTab === 'match' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            color: activeTab === 'match' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
            borderBottom: activeTab === 'match' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600
          }}
        >
          Compare JD
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 16px',
            border: 'none',
            background: activeTab === 'history' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
            color: activeTab === 'history' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
            borderBottom: activeTab === 'history' ? '2px solid hsl(var(--primary))' : '2px solid transparent',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <History size={14} />
          Comparison History ({history.length})
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        
        {activeTab === 'match' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {!matchResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '1.1rem' }}>Paste Job Description</h3>
                <textarea
                  className="form-input"
                  style={{
                    height: '240px',
                    fontFamily: 'inherit',
                    lineHeight: '1.6',
                    resize: 'none'
                  }}
                  placeholder="Paste the target role description, key skills required, and responsibilities here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleMatch}
                  disabled={isLoading || !jdText.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="spinner" />
                      Analyzing JD Alignment...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Calculate Match Alignment
                    </>
                  )}
                </button>
              </div>
            )}

            {matchResult && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Score Summary */}
                <div className="glass-panel" style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid hsl(var(--border-color))',
                  textAlign: 'center'
                }}>
                  <h3 style={{ fontSize: '1rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Match Alignment
                  </h3>
                  <span style={{
                    fontSize: '3.5rem',
                    fontWeight: 800,
                    fontFamily: 'Outfit',
                    color: getPercentageColor(matchResult.match_percentage),
                    lineHeight: 1
                  }}>
                    {matchResult.match_percentage}%
                  </span>

                  {/* Visual Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    marginTop: '16px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${matchResult.match_percentage}%`,
                      height: '100%',
                      background: getPercentageColor(matchResult.match_percentage),
                      borderRadius: '4px',
                      transition: 'width 1s ease'
                    }} />
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={18} style={{ color: 'hsl(var(--warning))' }} />
                    Missing Skills & Keywords
                  </h3>
                  {matchResult.missing_skills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {matchResult.missing_skills.map((skill, index) => (
                        <span
                          key={index}
                          style={{
                            background: 'rgba(234, 179, 8, 0.08)',
                            border: '1px solid hsl(var(--warning) / 0.3)',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            color: 'hsl(var(--text-primary))'
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'hsl(var(--success))', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle size={16} /> Candidate possesses all critical skills listed in the Job Description!
                    </p>
                  )}
                </div>

                {/* Suggestions */}
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} style={{ color: 'hsl(var(--primary))' }} />
                    Suggested Improvements
                  </h3>
                  {matchResult.improvements.length > 0 ? (
                    <ul style={{
                      paddingLeft: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      color: 'hsl(var(--text-secondary))',
                      fontSize: '0.9rem'
                    }}>
                      {matchResult.improvements.map((sug, index) => (
                        <li key={index} style={{ lineHeight: '1.6' }}>{sug}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: 'hsl(var(--success))', fontSize: '0.9rem' }}>
                      No improvements needed. The resume matches the job details perfectly.
                    </p>
                  )}
                </div>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setMatchResult(null);
                    setJdText('');
                  }}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Test Another Job Description
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {history.length === 0 ? (
              <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.9rem', textAlign: 'center', padding: '24px' }}>
                No past comparisons found. Run your first JD match analysis above!
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel"
                  style={{
                    padding: '16px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid hsl(var(--border-color))',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setMatchResult({
                      match_percentage: item.match_percentage,
                      missing_skills: item.missing_skills,
                      improvements: item.improvements
                    });
                    setActiveTab('match');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={16} style={{ color: 'hsl(var(--secondary))' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>JD Check</span>
                    </div>
                    <span style={{
                      fontSize: '1.1rem',
                      fontWeight: 850,
                      fontFamily: 'Outfit',
                      color: getPercentageColor(item.match_percentage)
                    }}>
                      {item.match_percentage}%
                    </span>
                  </div>
                  <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
                    Checked on {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JDMatcher;
