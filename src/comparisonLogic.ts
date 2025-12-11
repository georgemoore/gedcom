/**
 * Comparison and Matching Logic
 */

import {
  GedcomPerson,
  arePeopleLikely,
  getPersonDifferences,
} from './gedcomParser';

export interface PersonMatch {
  leftId: string;
  rightId: string;
  manual: boolean; // Whether this match was manually created
  differences: string[];
}

export interface ComparisonSession {
  id: string;
  timestamp: number;
  leftFilename: string;
  rightFilename: string;
  leftPeople: GedcomPerson[];
  rightPeople: GedcomPerson[];
  matches: PersonMatch[];
}

/**
 * Auto-match people based on similarity
 */
export function autoMatchPeople(
  leftPeople: GedcomPerson[],
  rightPeople: GedcomPerson[]
): PersonMatch[] {
  const matches: PersonMatch[] = [];
  const matchedRightIds = new Set<string>();

  for (const leftPerson of leftPeople) {
    for (const rightPerson of rightPeople) {
      if (matchedRightIds.has(rightPerson.id)) continue;

      if (arePeopleLikely(leftPerson, rightPerson)) {
        const differences = getPersonDifferences(leftPerson, rightPerson);
        matches.push({
          leftId: leftPerson.id,
          rightId: rightPerson.id,
          manual: false,
          differences,
        });
        matchedRightIds.add(rightPerson.id);
        break;
      }
    }
  }

  return matches;
}

/**
 * Add a manual match
 */
export function addMatch(
  matches: PersonMatch[],
  leftPeople: GedcomPerson[],
  rightPeople: GedcomPerson[],
  leftId: string,
  rightId: string
): PersonMatch[] {
  // Remove any existing matches for these people
  const filtered = matches.filter(
    m => !(m.leftId === leftId || m.rightId === rightId)
  );

  // Add new match
  const leftPerson = leftPeople.find(p => p.id === leftId);
  const rightPerson = rightPeople.find(p => p.id === rightId);

  if (leftPerson && rightPerson) {
    const differences = getPersonDifferences(leftPerson, rightPerson);
    filtered.push({
      leftId,
      rightId,
      manual: true,
      differences,
    });
  }

  return filtered;
}

/**
 * Remove a match
 */
export function removeMatch(
  matches: PersonMatch[],
  leftId: string,
  rightId: string
): PersonMatch[] {
  return matches.filter(m => !(m.leftId === leftId && m.rightId === rightId));
}

/**
 * Get unmatched people in left file
 */
export function getUnmatchedLeft(
  leftPeople: GedcomPerson[],
  matches: PersonMatch[]
): GedcomPerson[] {
  const matchedIds = new Set(matches.map(m => m.leftId));
  return leftPeople.filter(p => !matchedIds.has(p.id));
}

/**
 * Get unmatched people in right file
 */
export function getUnmatchedRight(
  rightPeople: GedcomPerson[],
  matches: PersonMatch[]
): GedcomPerson[] {
  const matchedIds = new Set(matches.map(m => m.rightId));
  return rightPeople.filter(p => !matchedIds.has(p.id));
}

/**
 * Get a match for a person if it exists
 */
export function getMatchForPerson(
  matches: PersonMatch[],
  personId: string,
  isLeft: boolean
): PersonMatch | undefined {
  return isLeft
    ? matches.find(m => m.leftId === personId)
    : matches.find(m => m.rightId === personId);
}

/**
 * Create a new comparison session
 */
export function createSession(
  leftFilename: string,
  rightFilename: string,
  leftPeople: GedcomPerson[],
  rightPeople: GedcomPerson[]
): ComparisonSession {
  const matches = autoMatchPeople(leftPeople, rightPeople);

  return {
    id: generateId(),
    timestamp: Date.now(),
    leftFilename,
    rightFilename,
    leftPeople,
    rightPeople,
    matches,
  };
}

/**
 * Save session to localStorage
 */
export function saveSession(session: ComparisonSession): void {
  const sessions = getAllSessions();
  const index = sessions.findIndex(s => s.id === session.id);

  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.push(session);
  }

  localStorage.setItem('gedcom_sessions', JSON.stringify(sessions));
}

/**
 * Load session from localStorage
 */
export function loadSession(id: string): ComparisonSession | null {
  const sessions = getAllSessions();
  return sessions.find(s => s.id === id) || null;
}

/**
 * Get all saved sessions
 */
export function getAllSessions(): ComparisonSession[] {
  try {
    const data = localStorage.getItem('gedcom_sessions');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a session
 */
export function deleteSession(id: string): void {
  const sessions = getAllSessions().filter(s => s.id !== id);
  localStorage.setItem('gedcom_sessions', JSON.stringify(sessions));
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
