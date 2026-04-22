/**
 * Predicts which quarter will have the highest total points.
 * @param {Array} teamAGames - Recent games for Team A
 * @param {Array} teamBGames - Recent games for Team B
 * @param {Array} h2hGames - Direct matches between Team A and Team B
 * @returns {Object} { predictedQuarter: string, confidence: number }
 */
export function predictHighestScoringQuarter(teamAGames, teamBGames, h2hGames) {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const scores = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    const frequency = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

    const processGames = (games, weight) => {
        games.forEach(game => {
            const qScores = game.scores;
            if (qScores && qScores.home && qScores.away) {
                quarters.forEach(q => {
                    const total = (qScores.home[q] || 0) + (qScores.away[q] || 0);
                    scores[q] += total * weight;
                });

                // Find which quarter was actually highest in this specific game
                let maxVal = -1;
                let maxQ = 'Q1';
                quarters.forEach(q => {
                    const total = (qScores.home[q] || 0) + (qScores.away[q] || 0);
                    if (total > maxVal) {
                        maxVal = total;
                        maxQ = q;
                    }
                });
                frequency[maxQ] += weight;
            }
        });
    };

    // H2H is the most important (Weight: 3)
    processGames(h2hGames, 3);
    // Recent form is important (Weight: 1)
    processGames(teamAGames, 1);
    processGames(teamBGames, 1);

    // Determine the winner based on combined frequency and point totals
    let predictedQuarter = 'Q1';
    let maxScore = -1;

    quarters.forEach(q => {
        if (frequency[q] > maxScore) {
            maxScore = frequency[q];
            predictedQuarter = q;
        }
    });

    // Simple confidence calculation based on frequency dominance
    const totalFreq = Object.values(frequency).reduce((a, b) => a + b, 0);
    const confidence = totalFreq > 0 ? (frequency[predictedQuarter] / totalFreq) : 0;

    return { 
        predictedQuarter, 
        confidence: Math.min(confidence + 0.2, 0.95) // Normalize for UI
    };
}

/**
 * Calculates which quarter historically has the lowest points.
 * @param {Array} games - List of games to analyze
 * @returns {Object} { lowestQuarter: string, averagePoints: number }
 */
export function calculateLowestScoringQuarter(games) {
    if (!games.length) return { lowestQuarter: null, averagePoints: 0 };

    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const totals = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
    let gameCount = 0;

    games.forEach(game => {
        const qScores = game.scores;
        if (qScores && qScores.home && qScores.away) {
            quarters.forEach(q => {
                totals[q] += (qScores.home[q] || 0) + (qScores.away[q] || 0);
            });
            gameCount++;
        }
    });

    let lowestQuarter = 'Q1';
    let minScore = Infinity;

    quarters.forEach(q => {
        const avg = totals[q] / gameCount;
        if (avg < minScore) {
            minScore = avg;
            lowestQuarter = q;
        }
    });

    const averagePointsPerGame = Object.values(totals).reduce((a, b) => a + b, 0) / gameCount;

    return { 
        lowestQuarter, 
        averagePoints: averagePointsPerGame 
    };
}