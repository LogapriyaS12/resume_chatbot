import React, { useState } from 'react';
import { 
  User, Briefcase, Award, Code, BookOpen, BarChart3,
  Mail, Phone, MapPin, Globe, CheckCircle, AlertTriangle
} from 'lucide-react';

const AnalysisViewer = ({ parsedData, atsAnalysis }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { personal_details, professional_summary, skills, experience, projects, education } = parsedData || {};
  const { score = 0, missing_keywords = [], suggestions = [] } = atsAnalysis || {};

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <User size={18} /> },
    { id: 'skills', name: 'Skills', icon: <Code size={18} /> },
    { id: 'experience', name: 'Experience', icon: <Briefcase size={18} /> },
    { id: 'projects', name: 'Projects', icon: <Award size={18} /> },
    { id: 'education', name: 'Education', icon: <BookOpen size={18} /> },
    { id: 'ats', name: 'ATS Analysis', icon: <BarChart3 size={18} /> },
  ];

  // SVG Circular progress details
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Helper to color code the ATS score
  const getScoreColor = (val) => {
    if (val >= 80) return 'hsl(var(--success))';
    if (val >= 50) return 'hsl(var(--warning))';
    return 'hsl(var(--danger))';
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid hsl(var(--border-color))',
        background: 'rgba(255, 255, 255, 0.02)',
        overflowX: 'auto',
        whiteSpace: 'nowrap'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '110px',
              padding: '16px 12px',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'hsl(var(--primary))' : 'hsl(var(--text-secondary))',
              borderBottom: activeTab === tab.id ? '2px solid hsl(var(--primary))' : '2px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: 'Outfit, sans-serif',
              fontWeight: activeTab === tab.id ? 600 : 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>{personal_details?.name || 'Candidate Profile'}</h2>
            
            {/* Contact Details Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '16px',
              borderRadius: '10px',
              border: '1px solid hsl(var(--border-color))'
            }}>
              {personal_details?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <Mail size={16} style={{ color: 'hsl(var(--primary))' }} />
                  <span>{personal_details.email}</span>
                </div>
              )}
              {personal_details?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <Phone size={16} style={{ color: 'hsl(var(--primary))' }} />
                  <span>{personal_details.phone}</span>
                </div>
              )}
              {personal_details?.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                  <MapPin size={16} style={{ color: 'hsl(var(--primary))' }} />
                  <span>{personal_details.location}</span>
                </div>
              )}
               {personal_details?.linkedin && (
                <a href={personal_details.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'hsl(var(--secondary))', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  <span>LinkedIn Profile</span>
                </a>
              )}
               {personal_details?.github && (
                <a href={personal_details.github} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'hsl(var(--secondary))', textDecoration: 'none' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                  <span>GitHub Profile</span>
                </a>
              )}
              {personal_details?.website && (
                <a href={personal_details.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'hsl(var(--secondary))', textDecoration: 'none' }}>
                  <Globe size={16} />
                  <span>Portfolio / Website</span>
                </a>
              )}
            </div>

            {/* Professional Summary */}
            {professional_summary && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'hsl(var(--secondary))' }}>Professional Summary</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{professional_summary}</p>
              </div>
            )}
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Extracted Skills</h2>
            
            {/* Technical Skills */}
            {skills?.technical && skills.technical.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'hsl(var(--primary))' }}>Technical Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.technical.map((skill, index) => (
                    <span 
                      key={index} 
                      style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid hsl(var(--primary) / 0.3)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'hsl(var(--text-primary))'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Soft Skills */}
            {skills?.soft && skills.soft.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', color: 'hsl(var(--secondary))' }}>Soft Skills & Core Competencies</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.soft.map((skill, index) => (
                    <span 
                      key={index} 
                      style={{
                        background: 'rgba(14, 165, 233, 0.1)',
                        border: '1px solid hsl(var(--secondary) / 0.3)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        color: 'hsl(var(--text-primary))'
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Work Experience & Internships</h2>
            {experience && experience.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {experience.map((exp, index) => (
                  <div 
                    key={index}
                    style={{
                      borderLeft: '2px solid hsl(var(--primary))',
                      paddingLeft: '18px',
                      position: 'relative'
                    }}
                  >
                    {/* Timeline dot */}
                    <div style={{
                      position: 'absolute',
                      left: '-7px',
                      top: '4px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'hsl(var(--primary))',
                      border: '2px solid hsl(var(--bg-base))'
                    }} />

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{exp.job_title}</h3>
                    <h4 style={{ fontSize: '0.95rem', color: 'hsl(var(--secondary))', marginBottom: '6px' }}>
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </h4>
                    
                    <span style={{
                      fontSize: '0.8rem',
                      background: 'rgba(255,255,255,0.05)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid hsl(var(--border-color))',
                      color: 'hsl(var(--text-muted))'
                    }}>
                      {exp.start_date} - {exp.end_date}
                    </span>

                    <ul style={{
                      marginTop: '12px',
                      paddingLeft: '20px',
                      color: 'hsl(var(--text-secondary))',
                      fontSize: '0.9rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      {exp.description.map((bullet, idx) => (
                        <li key={idx} style={{ lineHeight: '1.5' }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))' }}>No work experience detected.</p>
            )}
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Projects</h2>
            {projects && projects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                {projects.map((proj, index) => (
                  <div 
                    key={index}
                    className="glass-panel"
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid hsl(var(--border-color))'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{proj.title}</h3>
                      {proj.link && (
                        <a 
                          href={proj.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{
                            fontSize: '0.8rem',
                            color: 'hsl(var(--secondary))',
                            textDecoration: 'none',
                            fontWeight: 600
                          }}
                        >
                          Codebase / Demo
                        </a>
                      )}
                    </div>
                    
                    <p style={{
                      color: 'hsl(var(--text-secondary))',
                      fontSize: '0.9rem',
                      marginBottom: '12px',
                      lineHeight: '1.6'
                    }}>
                      {proj.description}
                    </p>

                    {proj.technologies && proj.technologies.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {proj.technologies.map((tech, idx) => (
                          <span 
                            key={idx}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid hsl(var(--border-color))',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              color: 'hsl(var(--text-muted))'
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))' }}>No projects detected.</p>
            )}
          </div>
        )}

        {/* EDUCATION TAB */}
        {activeTab === 'education' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Education Details</h2>
            {education && education.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {education.map((edu, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '10px',
                      border: '1px solid hsl(var(--border-color))'
                    }}
                  >
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{edu.degree || 'Degree'}</h3>
                    {edu.major && (
                      <h4 style={{ fontSize: '1rem', color: 'hsl(var(--secondary))', marginBottom: '4px' }}>
                        Major: {edu.major}
                      </h4>
                    )}
                    <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-secondary))', marginBottom: '8px' }}>
                      {edu.institution}
                    </p>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: 'hsl(var(--text-muted))'
                    }}>
                      <span>{edu.start_date} - {edu.end_date}</span>
                      {edu.grade && (
                        <span style={{
                          background: 'rgba(139, 92, 246, 0.15)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          color: 'hsl(var(--text-primary))'
                        }}>
                          Grade: {edu.grade}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'hsl(var(--text-muted))' }}>No education details detected.</p>
            )}
          </div>
        )}

        {/* ATS TAB */}
        {activeTab === 'ats' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>ATS Profile Score</h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              mdFlexDirection: 'row', // logic layout
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.01)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid hsl(var(--border-color))',
              marginBottom: '24px'
            }}>
              {/* Circular Gauge */}
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background Circle */}
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                  />
                  {/* Active Value Arc */}
                  <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="transparent"
                    stroke={getScoreColor(score)}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                  />
                </svg>
                {/* Center Text */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: getScoreColor(score) }}>
                    {score}%
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'center', maxWidth: '300px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>ATS Compatibility Score</h3>
                <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
                  Based on structure analysis, keyword density, section completion, and readability factors.
                </p>
              </div>
            </div>

            {/* Keyword Optimization */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} style={{ color: 'hsl(var(--warning))' }} />
                Missing Core Keywords
              </h3>
              {missing_keywords.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {missing_keywords.map((kw, index) => (
                    <span 
                      key={index}
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid hsl(var(--danger) / 0.3)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        color: 'hsl(var(--text-primary))'
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'hsl(var(--success))', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> All standard core industry keywords are well represented!
                </p>
              )}
            </div>

            {/* Structural Suggestions */}
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Improvement Suggestions</h3>
              {suggestions.length > 0 ? (
                <ul style={{
                  paddingLeft: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  color: 'hsl(var(--text-secondary))',
                  fontSize: '0.9rem'
                }}>
                  {suggestions.map((sug, index) => (
                    <li key={index} style={{ lineHeight: '1.6' }}>{sug}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'hsl(var(--success))', fontSize: '0.9rem' }}>
                  No layout or structural improvements suggested. The resume is highly optimized!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisViewer;
