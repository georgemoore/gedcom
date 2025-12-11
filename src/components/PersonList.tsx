import { forwardRef } from 'react';
import { GedcomPerson, getPersonDisplayName } from '../gedcomParser';
import { PersonMatch } from '../comparisonLogic';
import { Check, AlertCircle } from 'lucide-react';

interface Props {
  people: GedcomPerson[];
  matches: PersonMatch[];
  selectedId: string | null;
  onSelectPerson: (id: string) => void;
  isLeft: boolean;
}

const PersonList = forwardRef<HTMLDivElement, Props>(
  ({ people, matches, selectedId, onSelectPerson, isLeft }, ref) => {
    const getStatus = (personId: string) => {
      const match = isLeft
        ? matches.find(m => m.leftId === personId)
        : matches.find(m => m.rightId === personId);

      if (!match) return 'unmatched';
      if (match.differences.length > 0) return 'different';
      return 'matched';
    };

    const getSortedPeople = () => {
      // Sort by match status: matched with differences, then matched, then unmatched
      return [...people].sort((a, b) => {
        const statusA = getStatus(a.id);
        const statusB = getStatus(b.id);
        const order: Record<string, number> = {
          different: 0,
          matched: 1,
          unmatched: 2,
        };
        return order[statusA] - order[statusB];
      });
    };

    return (
      <div className="person-list" ref={ref}>
        {getSortedPeople().map(person => {
          const status = getStatus(person.id);
          const isSelected = selectedId === person.id;

          return (
            <div
              key={person.id}
              className={`person-item status-${status} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectPerson(person.id)}
            >
              <div className="person-item-header">
                <span className="person-name">
                  {getPersonDisplayName(person)}
                </span>
                {status === 'matched' && (
                  <Check size={16} className="status-icon matched" />
                )}
                {status === 'different' && (
                  <AlertCircle size={16} className="status-icon different" />
                )}
                {status === 'unmatched' && (
                  <AlertCircle size={16} className="status-icon unmatched" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

PersonList.displayName = 'PersonList';

export default PersonList;
