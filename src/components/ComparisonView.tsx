import { useState, useRef, useEffect } from 'react';
import { GedcomFile, GedcomPerson } from '../gedcomParser';
import {
  ComparisonSession,
  createSession,
  autoMatchPeople,
  addMatch,
  removeMatch,
  getMatchForPerson,
  getUnmatchedLeft,
  getUnmatchedRight,
  saveSession,
} from '../comparisonLogic';
import PersonList from './PersonList';
import PersonDetail from './PersonDetail';
import SessionControls from './SessionControls';
import { Link2, Unlink, RotateCcw } from 'lucide-react';

interface Props {
  leftFile: GedcomFile;
  rightFile: GedcomFile;
  initialSession: ComparisonSession | null;
  onSessionSaved: (session: ComparisonSession) => void;
  onBack: () => void;
}

function ComparisonView({
  leftFile,
  rightFile,
  initialSession,
  onSessionSaved,
  onBack,
}: Props) {
  const [session, setSession] = useState<ComparisonSession>(() =>
    initialSession ||
    createSession(leftFile.filename, rightFile.filename, leftFile.people, rightFile.people)
  );

  const [syncScroll, setSyncScroll] = useState(true);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchingMode, setMatchingMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'matched' | 'unmatched'>('all');

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  const leftUnmatched = getUnmatchedLeft(session.leftPeople, session.matches);
  const rightUnmatched = getUnmatchedRight(session.rightPeople, session.matches);

  const hasActiveMatch = selectedLeft && selectedRight
    ? session.matches.some(m => m.leftId === selectedLeft && m.rightId === selectedRight)
    : false;

  // Synchronized scrolling
  useEffect(() => {
    if (!syncScroll) return;

    const handleScroll = (source: 'left' | 'right') => {
      const sourceRef = source === 'left' ? leftScrollRef : rightScrollRef;
      const targetRef = source === 'left' ? rightScrollRef : leftScrollRef;

      if (sourceRef.current && targetRef.current) {
        targetRef.current.scrollTop = sourceRef.current.scrollTop;
      }
    };

    const leftEl = leftScrollRef.current;
    const rightEl = rightScrollRef.current;

    const onLeftScroll = () => handleScroll('left');
    const onRightScroll = () => handleScroll('right');

    leftEl?.addEventListener('scroll', onLeftScroll);
    rightEl?.addEventListener('scroll', onRightScroll);

    return () => {
      leftEl?.removeEventListener('scroll', onLeftScroll);
      rightEl?.removeEventListener('scroll', onRightScroll);
    };
  }, [syncScroll]);

  const handleMatch = () => {
    if (!selectedLeft || !selectedRight) return;

    if (hasActiveMatch) return;

    const newMatches = addMatch(
      session.matches,
      session.leftPeople,
      session.rightPeople,
      selectedLeft,
      selectedRight
    );

    setSession({ ...session, matches: newMatches });
    setMatchingMode(false);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleUnmatch = (leftId: string, rightId: string) => {
    const newMatches = removeMatch(session.matches, leftId, rightId);
    setSession({ ...session, matches: newMatches });
  };

  const handleSaveSession = () => {
    saveSession(session);
    onSessionSaved(session);
    alert('Session saved successfully!');
  };

  const handleResetMatches = () => {
    if (confirm('Reset all matches to auto-detected? Manual matches will be lost.')) {
      const newMatches = autoMatchPeople(session.leftPeople, session.rightPeople);
      setSession({ ...session, matches: newMatches });
    }
  };

  const getDisplayPeople = (
    people: GedcomPerson[],
    isLeft: boolean
  ): GedcomPerson[] => {
    if (filter === 'all') return people;

    if (filter === 'matched') {
      const matchedIds = new Set(
        session.matches.map(m => (isLeft ? m.leftId : m.rightId))
      );
      return people.filter(p => matchedIds.has(p.id));
    }

    if (filter === 'unmatched') {
      return isLeft ? leftUnmatched : rightUnmatched;
    }

    return people;
  };

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <div>
          <h2>Comparing Files</h2>
          <p className="file-info">
            {session.leftFilename} vs {session.rightFilename}
          </p>
        </div>
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
      </div>

      <SessionControls
        onSave={handleSaveSession}
        onReset={handleResetMatches}
      />

      <div className="comparison-controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={syncScroll}
              onChange={e => setSyncScroll(e.target.checked)}
            />
            Sync Scrolling
          </label>
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={matchingMode}
              onChange={e => setMatchingMode(e.target.checked)}
            />
            Manual Matching Mode
          </label>
        </div>

        <div className="control-group">
          <label>
            Filter:
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
            >
              <option value="all">All ({getDisplayPeople(session.leftPeople, true).length})</option>
              <option value="matched">
                Matched ({session.matches.length})
              </option>
              <option value="unmatched">
                Unmatched ({leftUnmatched.length})
              </option>
            </select>
          </label>
        </div>
      </div>

      <div className="comparison-content">
        <div className="comparison-column">
          <h3>{session.leftFilename}</h3>
          <PersonList
            ref={leftScrollRef}
            people={getDisplayPeople(session.leftPeople, true)}
            matches={session.matches}
            selectedId={selectedLeft}
            onSelectPerson={setSelectedLeft}
            isLeft={true}
          />
        </div>

        <div className="comparison-actions">
          {selectedLeft && selectedRight && (
            <button
              className="match-button"
              onClick={handleMatch}
              disabled={!matchingMode || hasActiveMatch}
              title={
                hasActiveMatch
                  ? 'These people are already matched'
                  : matchingMode
                  ? 'Create a manual match'
                  : 'Enable manual matching to create a link'
              }
            >
              <Link2 size={16} />
              Create Match
            </button>
          )}

          {selectedLeft && selectedRight && hasActiveMatch && (
            <button
              className="unmatch-button"
              onClick={() => handleUnmatch(selectedLeft, selectedRight)}
            >
              <Unlink size={16} />
              Break Match
            </button>
          )}

          <button
            className="reset-button"
            onClick={handleResetMatches}
            title="Reset to auto-detected matches"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        <div className="comparison-column">
          <h3>{session.rightFilename}</h3>
          <PersonList
            ref={rightScrollRef}
            people={getDisplayPeople(session.rightPeople, false)}
            matches={session.matches}
            selectedId={selectedRight}
            onSelectPerson={setSelectedRight}
            isLeft={false}
          />
        </div>
      </div>

      {selectedLeft && selectedRight && (
        <PersonDetail
          leftPerson={session.leftPeople.find(p => p.id === selectedLeft)!}
          rightPerson={session.rightPeople.find(p => p.id === selectedRight)!}
          match={getMatchForPerson(session.matches, selectedLeft, true)}
          onUnmatch={() => handleUnmatch(selectedLeft, selectedRight)}
        />
      )}
    </div>
  );
}

export default ComparisonView;
