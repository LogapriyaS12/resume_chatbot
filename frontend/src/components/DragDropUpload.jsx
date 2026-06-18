import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { resumeService } from '../services/api';

const DragDropUpload = ({ onUploadSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const processFile = async (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadState('error');
      setErrorMessage('Invalid file format. Only PDF files are supported.');
      return;
    }

    setUploadState('uploading');
    setErrorMessage('');
    setUploadedFile(file);

    try {
      const data = await resumeService.uploadResume(file);
      setUploadState('success');
      setTimeout(() => {
        onUploadSuccess(data);
        setUploadState('idle');
        setUploadedFile(null);
      }, 1500);
    } catch (err) {
      setUploadState('error');
      const msg = err.response?.data?.detail || 'An error occurred while uploading. Ensure your Gemini API Key is configured on the backend.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".pdf"
        onChange={handleChange}
      />
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={uploadState === 'idle' || uploadState === 'error' ? triggerFileInput : undefined}
        style={{
          border: isDragActive ? '2px dashed hsl(var(--primary))' : '2px dashed hsl(var(--border-color))',
          borderRadius: '12px',
          padding: '48px 24px',
          background: isDragActive ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          cursor: uploadState === 'idle' || uploadState === 'error' ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          transform: isDragActive ? 'scale(1.01)' : 'scale(1)',
          boxShadow: isDragActive ? '0 0 20px hsl(var(--primary) / 0.15)' : 'none'
        }}
        className="glow-hover"
      >
        {uploadState === 'idle' && (
          <>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <UploadCloud size={48} style={{ color: 'hsl(var(--primary))' }} />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Drag & Drop Candidate Resume</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginBottom: '4px' }}>
              Only PDF format is supported
            </p>
            <span style={{ color: 'hsl(var(--primary))', fontSize: '0.9rem', fontWeight: 600 }}>
              or click to browse files
            </span>
          </>
        )}

        {uploadState === 'uploading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div className="spinner"></div>
            <h3 style={{ fontSize: '1.1rem' }}>Extracting & Indexing Candidate Data...</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.85rem' }}>
              Parsing content: {uploadedFile?.name}
            </p>
            <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.8rem' }}>
              Calling Google Gemini API models
            </span>
          </div>
        )}

        {uploadState === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={48} style={{ color: 'hsl(var(--success))' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--success))' }}>Upload Complete!</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem' }}>
              Candidate profile and vector embeddings successfully created.
            </p>
          </div>
        )}

        {uploadState === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={48} style={{ color: 'hsl(var(--danger))' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'hsl(var(--danger))' }}>Upload Failed</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', maxWidth: '400px' }}>
              {errorMessage}
            </p>
            <span style={{ color: 'hsl(var(--primary))', fontSize: '0.9rem', fontWeight: 600, marginTop: '8px' }}>
              Click to try again
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DragDropUpload;
