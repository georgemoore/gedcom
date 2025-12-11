import { useState } from 'react';
import { GedcomFile } from './gedcomParser';
import { ComparisonSession } from './comparisonLogic';
import FileUploadView from './components/FileUploadView';
import ComparisonView from './components/ComparisonView';
import SessionManager from './components/SessionManager';
import './App.css';

type AppView = 'upload' | 'comparison' | 'sessions';

function App() {
  const [view, setView] = useState<AppView>('upload');
  const [leftFile, setLeftFile] = useState<GedcomFile | null>(null);
  const [rightFile, setRightFile] = useState<GedcomFile | null>(null);
  const [currentSession, setCurrentSession] = useState<ComparisonSession | null>(
    null
  );

  const handleFilesLoaded = (left: GedcomFile, right: GedcomFile) => {
    setLeftFile(left);
    setRightFile(right);
    setView('comparison');
  };

  const handleSessionLoaded = (session: ComparisonSession) => {
    setLeftFile({
      filename: session.leftFilename,
      people: session.leftPeople,
      recordCount: session.leftPeople.length,
    });
    setRightFile({
      filename: session.rightFilename,
      people: session.rightPeople,
      recordCount: session.rightPeople.length,
    });
    setCurrentSession(session);
    setView('comparison');
  };

  const handleBackToUpload = () => {
    setView('upload');
    setLeftFile(null);
    setRightFile(null);
    setCurrentSession(null);
  };

  const handleSessionSaved = (session: ComparisonSession) => {
    setCurrentSession(session);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>GEDCOM Compare</h1>
        <p className="subtitle">Family Tree Comparison Tool</p>
        <nav className="app-nav">
          <button
            className={`nav-btn ${view === 'upload' ? 'active' : ''}`}
            onClick={() => setView('upload')}
          >
            Upload Files
          </button>
          <button
            className={`nav-btn ${view === 'comparison' ? 'active' : ''}`}
            disabled={!leftFile || !rightFile}
            onClick={() => setView('comparison')}
          >
            Compare
          </button>
          <button
            className={`nav-btn ${view === 'sessions' ? 'active' : ''}`}
            onClick={() => setView('sessions')}
          >
            Sessions
          </button>
        </nav>
      </header>

      <main className="app-content">
        {view === 'upload' && (
          <FileUploadView onFilesLoaded={handleFilesLoaded} />
        )}
        {view === 'comparison' && leftFile && rightFile && (
          <ComparisonView
            leftFile={leftFile}
            rightFile={rightFile}
            initialSession={currentSession}
            onSessionSaved={handleSessionSaved}
            onBack={handleBackToUpload}
          />
        )}
        {view === 'sessions' && (
          <SessionManager
            onSessionLoaded={handleSessionLoaded}
            onNavigateToComparison={() => setView('comparison')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
