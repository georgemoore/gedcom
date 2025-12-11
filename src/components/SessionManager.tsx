import { useState } from 'react';
import { ComparisonSession, getAllSessions, loadSession, deleteSession } from '../comparisonLogic';
import { Trash2, RotateCcw } from 'lucide-react';

interface Props {
  onSessionLoaded: (session: ComparisonSession) => void;
  onNavigateToComparison: () => void;
}

function SessionManager({ onSessionLoaded, onNavigateToComparison }: Props) {
  const [sessions, setSessions] = useState<ComparisonSession[]>(getAllSessions());

  const handleLoadSession = (id: string) => {
    const session = loadSession(id);
    if (session) {
      onSessionLoaded(session);
      onNavigateToComparison();
    }
  };

  const handleDeleteSession = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(id);
      setSessions(getAllSessions());
    }
  };

  return (
    <div className="session-manager">
      <h2>Saved Sessions</h2>

      {sessions.length === 0 ? (
        <div className="no-sessions">
          <p>No saved sessions yet.</p>
          <p>Create a comparison and save it to access it later.</p>
        </div>
      ) : (
        <div className="sessions-list">
          {sessions
            .sort((a, b) => b.timestamp - a.timestamp)
            .map(session => (
              <div key={session.id} className="session-item">
                <div className="session-info">
                  <h3 className="session-title">
                    {session.leftFilename} ↔ {session.rightFilename}
                  </h3>
                  <p className="session-stats">
                    Left: {session.leftPeople.length} | Right:{' '}
                    {session.rightPeople.length} | Matches: {session.matches.length}
                  </p>
                  <p className="session-date">
                    Saved: {new Date(session.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="session-actions">
                  <button
                    className="load-button"
                    onClick={() => handleLoadSession(session.id)}
                  >
                    <RotateCcw size={16} />
                    Load
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default SessionManager;
