import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeWorkspace from './pages/ResumeWorkspace';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard'); // dashboard, workspace
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [activeCandidateName, setActiveCandidateName] = useState(null);

  const handleSelectResume = (id) => {
    setSelectedResumeId(id);
    setCurrentPage('workspace');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
    setSelectedResumeId(null);
    setActiveCandidateName(null);
  };

  // Callback to set candidate name in the navbar dynamically
  const handleUpdateCandidateName = (name) => {
    setActiveCandidateName(name);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Navbar */}
      <Navbar 
        activeCandidateName={activeCandidateName} 
        onBackToDashboard={handleBackToDashboard} 
      />
      
      {/* Content Routing */}
      <main style={{ flex: 1, minHeight: 0 }}>
        {currentPage === 'dashboard' ? (
          <Dashboard 
            onSelectResume={handleSelectResume} 
          />
        ) : (
          <ResumeWorkspace 
            resumeId={selectedResumeId} 
            onBack={handleBackToDashboard} 
            onLoadCandidateName={handleUpdateCandidateName}
          />
        )}
      </main>

    </div>
  );
}

export default App;
