const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export function getHighestScoringQuarter(games) {
  const counts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  for (const game of games) {
    if (!quarters.every((q) => q in game)) {
      throw new Error('Game data missing quarter scores');
    }
    const maxQuarter = quarters.reduce((best, q) => (game[q] > game[best] ? q : best), 'Q1');
    counts[maxQuarter] += 1;
  }

  const maxCount = Math.max(...Object.values(counts));
  const candidates = quarters.filter((q) => counts[q] === maxCount);
  return candidates[0];
}

export function predictHighestScoringQuarter(teamAGames, teamBGames, h2hGames = []) {
  const aCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const bCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

  for (const game of teamAGames) {
    const maxQ = getHighestScoringQuarter([game]);
    aCounts[maxQ] += 1;
  }

  for (const game of teamBGames) {
    const maxQ = getHighestScoringQuarter([game]);
    bCounts[maxQ] += 1;
  }

  const combinedCounts = quarters.reduce((acc, q) => {
    acc[q] = aCounts[q] + bCounts[q];
    return acc;
  }, {});

  if (h2hGames.length) {
    const h2hQuarter = getHighestScoringQuarter(h2hGames);
    combinedCounts[h2hQuarter] += 0.3;
  }

  const maxCount = Math.max(...Object.values(combinedCounts));
  const candidates = quarters.filter((q) => combinedCounts[q] === maxCount);
  const predictedQuarter = candidates[0];
  const totalCounts = Object.values(combinedCounts).reduce((sum, value) => sum + value, 0);
  const confidence = totalCounts > 0 ? maxCount / totalCounts : 0;

  return {
    predictedQuarter,
    confidence,
  };
}

export function calculateLowestScoringQuarter(games) {
  if (!games.length) {
    return { lowestQuarter: null, averagePoints: null };
  }

  const quarterTotals = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

  for (const game of games) {
    if (!quarters.every((q) => q in game)) {
      return { lowestQuarter: null, averagePoints: null };
    }
    for (const q of quarters) {
      quarterTotals[q] += game[q];
    }
  }

  const numGames = games.length;
  const averages = quarters.reduce((acc, q) => {
    acc[q] = quarterTotals[q] / numGames;
    return acc;
  }, {});

  const lowestQuarter = quarters.reduce((best, q) => {
    return averages[q] < averages[best] ? q : best;
  }, 'Q1');

  return { lowestQuarter, averagePoints: averages[lowestQuarter] };
}
