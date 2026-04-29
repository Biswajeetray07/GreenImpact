export function generateRandomDraw(): number[] {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export function generateAlgorithmDraw(allScores: number[]): number[] {
  if (!allScores || allScores.length === 0) {
    return generateRandomDraw();
  }

  const frequency: Record<number, number> = {};
  for (let i = 1; i <= 45; i++) frequency[i] = 0;
  
  for (const score of allScores) {
    if (score >= 1 && score <= 45) {
      frequency[score]++;
    }
  }

  const weightedArray: number[] = [];
  for (let i = 1; i <= 45; i++) {
    const weight = frequency[i] + 1; // Add 1 to ensure every number has a chance
    for (let w = 0; w < weight; w++) {
      weightedArray.push(i);
    }
  }

  const result = new Set<number>();
  while (result.size < 5) {
    const randomIndex = Math.floor(Math.random() * weightedArray.length);
    result.add(weightedArray[randomIndex]);
  }

  return Array.from(result).sort((a, b) => a - b);
}

export function calculateMatches(userScores: number[], drawnNumbers: number[]): number {
  const drawnSet = new Set(drawnNumbers);
  let matches = 0;
  for (const score of userScores) {
    if (drawnSet.has(score)) {
      matches++;
    }
  }
  return matches;
}

export function getTier(matchCount: number): number | null {
  if (matchCount === 5) return 5;
  if (matchCount === 4) return 4;
  if (matchCount === 3) return 3;
  return null;
}
