import React, { useState, useEffect } from 'react';
import { Sparkles, Users, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import DragDropUpload from '../components/DragDropUpload';
import ResumeCard from '../components/ResumeCard';
import { resumeService } from '../services/api';

const Dashboard = ({ onSelectResume }) => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const data = await resumeService.listResumes();
      setResumes(data);
    } catch (err) {
      console.error("Failed to load candidates", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = (newResume) => {
    // Navigate straight to workspace for immediate feedback
    onSelectResume(newResume.id);
  };

  const handleDeleteResume = async (id) => {
    await resumeService.deleteResume(id);
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="app-container" style={{ minHeight: '80vh' }}>
      
      {/* Welcome Banner */}
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '6px 16px',
          borderRadius: '20px',
          border: '1px solid hsl(var(--primary) / 0.3)',
          marginBottom: '16px',
          fontSize: '0.85rem',
          color: 'hsl(var(--primary))',
          fontWeight: 600
        }}>
          <Sparkles size={14} />
          <span>Generative AI Recruitment Assistant</span>
        </div>

        <h1 style={{
          fontSize: '2.8rem',
          lineHeight: '1.2',
          marginBottom: '12px',
          fontFamily: 'Outfit, sans-serif'
        }}>
          Evaluate Candidates with <span className="gradient-text">RAG & Gemini API</span>
        </h1>
        <p style={{
          color: 'hsl(var(--text-secondary))',
          maxWidth: '600px',
          margin: '0 auto',
          fontSize: '1.05rem',
          lineHeight: '1.7'
        }}>
          Upload a candidate's resume PDF. Automatically extract skills, work achievements, estimate ATS compatibility, match job alignment, and run interactive RAG chat sessions.
        </p>
      </div>

      {/* Grid for Upload & General Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '24px',
        mdGridTemplateColumns: '2fr 1fr', // conceptual grid layout
        marginBottom: '40px'
      }}>
        
        {/* Upload Zone */}
        <div>
          <DragDropUpload onUploadSuccess={handleUploadSuccess} />
        </div>
        
        {/* Statistics Panels */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.15)',
              padding: '12px',
              borderRadius: '10px',
              color: 'hsl(var(--primary))'
            }}>
              <Users size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Profiles Scanned</span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Outfit' }}>{resumes.length}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              background: 'rgba(14, 165, 233, 0.15)',
              padding: '12px',
              borderRadius: '10px',
              color: 'hsl(var(--secondary))'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase' }}>Extraction Pipeline</span>
              <h3 style={{ fontSize: '1.1rem', color: 'hsl(var(--success))', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                Gemini 1.5 Flash Active
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Candidates Section */}
      <div style={{ borderTop: '1px solid hsl(var(--border-color))', paddingTop: '32px' }}>
        <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText size={22} style={{ color: 'hsl(var(--secondary))' }} />
          Scanned Candidates
        </h2>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <div className="spinner"></div>
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass-panel" style={{
            padding: '48px 24px',
            textAlign: 'center',
            marginTop: '20px',
            color: 'hsl(var(--text-secondary))'
          }}>
            <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>No resumes uploaded yet.</p>
            <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-muted))' }}>Drag a PDF resume above to scan and create a candidate workspace.</p>
          </div>
        ) : (
          <div className="dashboard-grid">
            {resumes.map(resume => (
              <ResumeCard 
                key={resume.id} 
                resume={resume} 
                onSelect={onSelectResume} 
                onDelete={handleDeleteResume}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
