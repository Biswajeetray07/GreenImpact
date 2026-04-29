export function calculatePrizePool(activeSubscriberCount: number, prizeContributionPerSubscriber: number, previousJackpot: number) {
  const newMoney = activeSubscriberCount * prizeContributionPerSubscriber;
  const total = newMoney + previousJackpot;
  
  const jackpot = (newMoney * 0.40) + previousJackpot;
  const fourMatch = newMoney * 0.35;
  const threeMatch = newMoney * 0.25;

  return {
    jackpot,
    fourMatch,
    threeMatch,
    total
  };
}

export function calculatePrizePerWinner(tierPool: number, winnerCount: number): number {
  if (winnerCount === 0) return 0;
  return Math.floor((tierPool / winnerCount) * 100) / 100;
}
