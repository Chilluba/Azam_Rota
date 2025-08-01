export interface Group {
  id: number;
  employees: string[];
}

// Simple pseudo-random number generator for deterministic shuffling
function prng(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

// Fisher-Yates shuffle algorithm using our deterministic PRNG
function shuffle(array: string[], seed: number): string[] {
  const random = prng(seed);
  const result = [...array];
  let currentIndex = result.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex--;

    [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
  }

  return result;
}


export function generateSchedule(
  allEmployees: string[],
  numGroups: number,
  unavailableEmployees: string[]
): Group[] {
  if (numGroups <= 0) {
    throw new Error("Number of groups must be greater than zero.");
  }
  
  const availableEmployees = allEmployees
    .filter(emp => !unavailableEmployees.includes(emp));

  if (availableEmployees.length === 0) {
    return Array.from({ length: numGroups }, (_, i) => ({ id: i + 1, employees: [] }));
  }

  // Use the number of days since the Unix epoch as a seed for daily rotation
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  
  // Deterministically shuffle employees based on the current day
  const shuffledEmployees = shuffle(availableEmployees, daysSinceEpoch);

  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    id: i + 1,
    employees: [],
  }));

  shuffledEmployees.forEach((employee, index) => {
    const groupIndex = index % numGroups;
    groups[groupIndex].employees.push(employee);
  });

  return groups;
}
