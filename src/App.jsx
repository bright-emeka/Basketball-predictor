import { useState, useEffect } from 'react';
import MatchCard from './components/MatchCard';
import { BasketballAPI } from './utils/api';
import { predictHighestScoringQuarter } from './predictionLogic';

const leagues = [
  { id: 12, name: 'NBA' },
  { id: 12, name: 'EuroLeague' }, // Note: EuroLeague might have different id, adjust as needed
];

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(leagues[0].id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, [selectedLeague]);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const api = new BasketballAPI();
      const games = await api.getGames(selectedLeague);
      // Filter to recent or upcoming, perhaps last 10 or so
      const recentGames = games.slice(0, 10);
      setMatches(recentGames);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (match) => {
    const api = new BasketballAPI();
    const homeId = match.teams.home.id;
    const awayId = match.teams.away.id;

    const [homeGames, awayGames, h2hGames] = await Promise.all([
      api.getLastGames(homeId),
      api.getLastGames(awayId),
      api.getH2hGames(homeId, awayId),
    ]);

    const { predictedQuarter, confidence } = predictHighestScoringQuarter(
      homeGames,
      awayGames,
      h2hGames
    );

    return { quarter: predictedQuarter, confidence };
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Basketball Prediction Dashboard</h1>
      </header>

      <div className="mb-4">
        <label className="text-white mr-2">Select League:</label>
        <select
          value={selectedLeague}
          onChange={(e) => setSelectedLeague(Number(e.target.value))}
          className="bg-gray-800 text-white p-2 rounded"
        >
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-white">Loading matches...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} onPredict={handlePredict} />
        ))}
      </div>
    </div>
  );
}

export default App;
