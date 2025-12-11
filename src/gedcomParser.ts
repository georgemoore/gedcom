/**
 * GEDCOM Parser
 * Parses GEDCOM files and extracts individual records
 */

export interface GedcomPerson {
  id: string;
  name: string;
  givenNames: string;
  surname: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  sex?: string;
  familiesAsSpouse?: string[];
  familiesAsChild?: string[];
  notes?: string;
  rawData: Record<string, string[]>;
}

export interface GedcomFile {
  filename: string;
  people: GedcomPerson[];
  parseDate?: string;
  recordCount: number;
}

/**
 * Parse a GEDCOM file text and extract individuals
 */
export function parseGedcom(text: string, filename: string): GedcomFile {
  const lines = text.split('\n').map(line => line.trim());
  const people: GedcomPerson[] = [];
  let currentId: string | null = null;
  const currentRecord: Record<string, string[]> = {};

  for (const line of lines) {
    if (!line) continue;

    const parts = line.split(/\s+/);
    const level = parseInt(parts[0]);
    const tag = parts[1];
    const value = parts.slice(2).join(' ');

    // Process individual records
    if (level === 0 && tag === 'INDI') {
      if (currentId) {
        const person = buildPerson(currentId, currentRecord);
        if (person) people.push(person);
      }
      currentId = value.replace(/[@]/g, '');
      Object.keys(currentRecord).forEach(key => delete currentRecord[key]);
    } else if (currentId && level === 1) {
      if (!currentRecord[tag]) {
        currentRecord[tag] = [];
      }
      currentRecord[tag].push(value);
    } else if (currentId && level === 2) {
      // Handle sub-tags like DATE, PLAC
      const lastTag = Object.keys(currentRecord).pop();
      if (lastTag && currentRecord[lastTag].length > 0) {
        currentRecord[lastTag][currentRecord[lastTag].length - 1] += ` [${tag}:${value}]`;
      }
    }
  }

  // Don't forget the last record
  if (currentId) {
    const person = buildPerson(currentId, currentRecord);
    if (person) people.push(person);
  }

  return {
    filename,
    people,
    parseDate: new Date().toISOString(),
    recordCount: people.length,
  };
}

function buildPerson(
  id: string,
  record: Record<string, string[]>
): GedcomPerson | null {
  // Extract name
  const nameRaw = record.NAME?.[0] || '';
  const nameParts = parseGedcomName(nameRaw);

  // Extract birth info
  const birth = record.BIRT?.[0] || '';
  const birthData = parseEventData(birth);

  // Extract death info
  const death = record.DEAT?.[0] || '';
  const deathData = parseEventData(death);

  return {
    id,
    name: `${nameParts.given} ${nameParts.surname}`.trim(),
    givenNames: nameParts.given,
    surname: nameParts.surname,
    birthDate: birthData.date,
    birthPlace: birthData.place,
    deathDate: deathData.date,
    deathPlace: deathData.place,
    sex: record.SEX?.[0],
    familiesAsSpouse: record.FAMS?.map(f => f.replace(/[@]/g, '')) || [],
    familiesAsChild: record.FAMC?.map(f => f.replace(/[@]/g, '')) || [],
    notes: record.NOTE?.join('; '),
    rawData: record,
  };
}

function parseGedcomName(
  nameRaw: string
): { given: string; surname: string } {
  // GEDCOM format: "Given /Surname/"
  const match = nameRaw.match(/^([^/]*)\s*\/([^/]*)\/?/);
  if (match) {
    return {
      given: match[1].trim(),
      surname: match[2].trim(),
    };
  }
  return {
    given: nameRaw.trim(),
    surname: '',
  };
}

function parseEventData(eventStr: string): { date?: string; place?: string } {
  const dateMatch = eventStr.match(/\[DATE:([^\]]+)\]/);
  const placeMatch = eventStr.match(/\[PLAC:([^\]]+)\]/);

  return {
    date: dateMatch ? dateMatch[1] : undefined,
    place: placeMatch ? placeMatch[1] : undefined,
  };
}

/**
 * Extract display name for a person (name and birth date)
 */
export function getPersonDisplayName(person: GedcomPerson): string {
  let display = person.name;
  if (person.birthDate) {
    display += ` (b. ${person.birthDate})`;
  }
  return display;
}

/**
 * Check if two people are likely the same based on name and birth date
 */
export function arePeopleLikely(person1: GedcomPerson, person2: GedcomPerson): boolean {
  // Exact name match and same birth date
  if (
    person1.name === person2.name &&
    person1.birthDate === person2.birthDate &&
    person1.birthDate
  ) {
    return true;
  }

  // Similar names (accounting for typos) and same birth date
  const nameSimilarity = calculateSimilarity(person1.name, person2.name);
  if (nameSimilarity > 0.8 && person1.birthDate === person2.birthDate && person1.birthDate) {
    return true;
  }

  return false;
}

/**
 * Calculate string similarity (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function getEditDistance(s1: string, s2: string): number {
  const costs: number[] = [];
  
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  return costs[s2.length];
}

/**
 * Get differences between two people
 */
export function getPersonDifferences(
  person1: GedcomPerson,
  person2: GedcomPerson
): string[] {
  const differences: string[] = [];

  if (person1.birthDate !== person2.birthDate) {
    differences.push(
      `Birth Date: "${person1.birthDate || 'N/A'}" vs "${person2.birthDate || 'N/A'}"`
    );
  }

  if (person1.birthPlace !== person2.birthPlace) {
    differences.push(
      `Birth Place: "${person1.birthPlace || 'N/A'}" vs "${person2.birthPlace || 'N/A'}"`
    );
  }

  if (person1.deathDate !== person2.deathDate) {
    differences.push(
      `Death Date: "${person1.deathDate || 'N/A'}" vs "${person2.deathDate || 'N/A'}"`
    );
  }

  if (person1.deathPlace !== person2.deathPlace) {
    differences.push(
      `Death Place: "${person1.deathPlace || 'N/A'}" vs "${person2.deathPlace || 'N/A'}"`
    );
  }

  if (person1.sex !== person2.sex) {
    differences.push(
      `Sex: "${person1.sex || 'N/A'}" vs "${person2.sex || 'N/A'}"`
    );
  }

  return differences;
}
