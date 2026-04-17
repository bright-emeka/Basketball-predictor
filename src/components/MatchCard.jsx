import { useState } from 'react';

const MatchCard = ({ match, onPredict }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const pred = await onPredict(match);
      setPrediction(pred);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const home = match.teams.home;
  const away = match.teams.away;
  const scores = match.scores;
  const isLive = match.status.short === 'LIVE' || match.status.short === 'HT';
  const scoreText = isLive ? `${scores.home.total || 0} - ${scores.away.total || 0}` : 'Upcoming';

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md m-2">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-white font-bold">{home.name}</p>
          <p className="text-gray-300">vs</p>
          <p className="text-white font-bold">{away.name}</p>
        </div>
        <div className="text-center">
          <p className="text-white text-xl">{scoreText}</p>
          {isLive && <p className="text-green-400 text-sm">Live</p>}
        </div>
      </div>
      <div className="mt-2">
        {prediction ? (
          <span className={`inline-block px-2 py-1 rounded text-white ${prediction.confidence > 0.5 ? 'bg-green-500' : 'bg-red-500'}`}>
            {prediction.quarter} ({(prediction.confidence * 100).toFixed(0)}%)
          </span>
        ) : (
          <button
            onClick={handlePredict}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {loading ? 'Predicting...' : 'Predict'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MatchCard;