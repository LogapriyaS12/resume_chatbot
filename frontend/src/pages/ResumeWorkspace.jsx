import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Briefcase, HelpCircle, Loader2 } from 'lucide-react';
import { resumeService } from '../services/api';
import AnalysisViewer from '../components/AnalysisViewer';
import ChatInterface from '../components/ChatInterface';
import JDMatcher from '../components/JDMatcher';
import QuestionGenerator from '../components/QuestionGenerator';

const ResumeWorkspace = ({ resumeId, onBack, onLoadCandidateName }) => {
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('chat'); // chat, jd, interview

  useEffect(() => {
    if (resumeId) {
      fetchResumeDetails();
    }
  }, [resumeId]);

  const fetchResumeDetails = async () => {
    setIsLoading(true);
    try {
      const data = await resumeService.getResume(resumeId);
      setResumeData(data);
      if (onLoadCandidateName && data?.parsed_data?.personal_details?.name) {
        onLoadCandidateName(data.parsed_data.personal_details.name);
      }
    } catch (err) {
      alert("Failed to load candidate details: " + err.message);
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        gap: '16px'
      }}>
        <Loader2 size={40} className="spinner" style={{ color: 'hsl(var(--primary))' }} />
        <span style={{ fontSize: '1rem', color: 'hsl(var(--text-secondary))' }}>Loading Candidate Workspace...</span>
      </div>
    );
  }

  const candidateName = resumeData?.parsed_data?.personal_details?.name || resumeData?.filename;

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: '600px' }}>
      
      {/* Workspace Sub Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        flexShrink: 0
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'Outfit' }}>
            {candidateName}
          </h1>
          <p style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>
            File: {resumeData?.filename}
          </p>
        </div>
      </div>

      {/* Main Workspace Workspace Container */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flex: 1,
        minHeight: 0, // Critical for nested scroll to work
        height: '100%'
      }}>
        
        {/* Left Pane - Profile Visual Analysis */}
        <div style={{
          flex: 1,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <AnalysisViewer 
            parsedData={resumeData?.parsed_data} 
            atsAnalysis={resumeData?.ats_analysis} 
          />
        </div>

        {/* Right Pane - Interactive Action Hub */}
        <div style={{
          flex: 1.2,
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="glass-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
          }}>
            {/* Action Selection Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid hsl(var(--border-color))',
              background: 'rgba(255, 255, 255, 0.03)'
            }}>
              <button
                onClick={() => setActiveWorkspaceTab('chat')}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  border: 'none',
                  background: activeWorkspaceTab === 'chat' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: activeWorkspaceTab === 'chat' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  borderBottom: activeWorkspaceTab === 'chat' ? '2.5px solid hsl(var(--primary))' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                <MessageSquare size={16} />
                Ask Assistant
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('jd')}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  border: 'none',
                  background: activeWorkspaceTab === 'jd' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: activeWorkspaceTab === 'jd' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  borderBottom: activeWorkspaceTab === 'jd' ? '2.5px solid hsl(var(--primary))' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                <Briefcase size={16} />
                JD Matcher
              </button>

              <button
                onClick={() => setActiveWorkspaceTab('interview')}
                style={{
                  flex: 1,
                  padding: '16px 12px',
                  border: 'none',
                  background: activeWorkspaceTab === 'interview' ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                  color: activeWorkspaceTab === 'interview' ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
                  borderBottom: activeWorkspaceTab === 'interview' ? '2.5px solid hsl(var(--primary))' : '2.5px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontFamily: 'Outfit, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                <HelpCircle size={16} />
                Interview Coach
              </button>
            </div>

            {/* Render Target Panel */}
            <div style={{ flex: 1, minHeight: 0, padding: '20px' }}>
              {activeWorkspaceTab === 'chat' && <ChatInterface resumeId={resumeId} />}
              {activeWorkspaceTab === 'jd' && <JDMatcher resumeId={resumeId} />}
              {activeWorkspaceTab === 'interview' && <QuestionGenerator resumeId={resumeId} />}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ResumeWorkspace;
