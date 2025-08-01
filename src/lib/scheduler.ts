export interface Group {
  id: number;
  employees: string[];
}

export function generateSchedule(
  allEmployees: string[],
  numGroups: number,
  unavailableEmployees: string[]
): Group[] {
  const availableEmployees = allEmployees
    .filter(emp => !unavailableEmployees.includes(emp))
    .sort(); // Sort for consistent order

  if (availableEmployees.length === 0 || numGroups <= 0) {
    return Array.from({ length: numGroups }, (_, i) => ({ id: i + 1, employees: [] }));
  }

  // Use the number of days since the Unix epoch for daily rotation
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  
  const groups: Group[] = Array.from({ length: numGroups }, (_, i) => ({
    id: i + 1,
    employees: [],
  }));

  availableEmployees.forEach((employee, index) => {
    // The core rotation logic: group assignment shifts by 1 each day
    const groupIndex = (index + daysSinceEpoch) % numGroups;
    groups[groupIndex].employees.push(employee);
  });

  return groups;
}
