import { useState } from 'react';
import { GedcomPerson } from '../gedcomParser';
import { PersonMatch } from '../comparisonLogic';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface Props {
  leftPerson: GedcomPerson;
  rightPerson: GedcomPerson;
  match?: PersonMatch;
  onUnmatch: () => void;
}

function PersonDetail({ leftPerson, rightPerson, match, onUnmatch }: Props) {
  const [expanded, setExpanded] = useState(true);

  const renderField = (label: string, leftValue?: string, rightValue?: string) => {
    const different = leftValue !== rightValue;

    return (
      <div className={`detail-field ${different ? 'different' : ''}`}>
        <div className="field-label">{label}</div>
        <div className="field-values">
          <div className="field-value left">
            {different && <AlertCircle size={14} className="alert-icon" />}
            {leftValue || 'N/A'}
          </div>
          <div className="field-value right">
            {different && <AlertCircle size={14} className="alert-icon" />}
            {rightValue || 'N/A'}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="person-detail-panel">
      <div className="detail-header">
        <button
          className="expand-button"
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronDown size={20} style={{
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }} />
          <span>Details</span>
        </button>
        {match && match.differences.length > 0 && (
          <span className="difference-badge">{match.differences.length} differences</span>
        )}
        {match && match.manual && (
          <span className="manual-match-badge">Manual Match</span>
        )}
        {match && (
          <button className="unmatch-link" onClick={onUnmatch}>
            Unmatch
          </button>
        )}
      </div>

      {expanded && (
        <div className="detail-content">
          {renderField('Name', leftPerson.name, rightPerson.name)}
          {renderField('Birth Date', leftPerson.birthDate, rightPerson.birthDate)}
          {renderField('Birth Place', leftPerson.birthPlace, rightPerson.birthPlace)}
          {renderField('Death Date', leftPerson.deathDate, rightPerson.deathDate)}
          {renderField('Death Place', leftPerson.deathPlace, rightPerson.deathPlace)}
          {renderField('Sex', leftPerson.sex, rightPerson.sex)}

          {match && match.differences.length > 0 && (
            <div className="differences-section">
              <h4>Detected Differences:</h4>
              <ul className="differences-list">
                {match.differences.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PersonDetail;
