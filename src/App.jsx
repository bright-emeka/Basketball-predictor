import { useState } from 'react';
import './App.css';
import { BasketballAPI } from './basketballApi';
import {
  predictHighestScoringQuarter,
  calculateLowestScoringQuarter,
} from './predictionLogic';

const API_KEY = '3c1251bdfb2edb287354c625b3afe11';

function App() {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [result, setResult] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const resetMessages = () => {
    setResult('');
    setDetails('');
    setStatus('');
    setError('');
  };

  const handlePredict = async (type) => {
    resetMessages();
    if (!team1.trim() || !team2.trim()) {
      setError('Please enter both team names.');
      return;
    }

    setStatus(`Fetching data and predicting ${type}...`);

    try {
      const api = new BasketballAPI(API_KEY);
      const aId = await api.getTeamId(team1.trim());
      const bId = await api.getTeamId(team2.trim());

      if (!aId || !bId) {
        setError(`Could not find one of the teams. Check spelling.`);
        setStatus('');
        return;
      }

      const aGames = await api.getLastGames(aId);
      const bGames = await api.getLastGames(bId);
      const h2hGames = await api.getH2hGames(aId, bId);

      if (type === 'highest') {
        const { predictedQuarter, confidence } = predictHighestScoringQuarter(aGames, bGames, h2hGames);
        setResult(`Predicted highest scoring quarter: ${predictedQuarter}`);
        setDetails(`Confidence: ${(confidence * 100).toFixed(0)}%`);
      } else {
        const { lowestQuarter, averagePoints } = calculateLowestScoringQuarter(h2hGames.length ? h2hGames : aGames);
        setResult(`Lowest scoring quarter: ${lowestQuarter}`);
        setDetails(`Avg points: ${averagePoints.toFixed(1)}`);
      }
      setStatus('');
    } catch (err) {
      setError(`Error: ${err.message}`);
      setStatus('');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Prediction Dashboard</h1>
      </header>

      <section className="form-panel">
        <div className="manual-input-row">
          <div className="input-group">
            <input
              type="text"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              placeholder="Home Team"
            />
          </div>

          <div className="vs-circle">VS</div>

          <div className="input-group">
            <input
              type="text"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              placeholder="Away Team"
            />
          </div>
        </div>

        <div className="button-group">
          <button onClick={() => handlePredict('highest')}>Predict Highest</button>
          <p> </p>
          <button onClick={() => handlePredict('lowest')}>Predict Lowest</button>
        </div>
      </section>

      {status && <div className="status-msg">{status}</div>}
      {error && <div className="error-msg">{error}</div>}
      
      {result && (
        <div className="result-card">
          <h2>{result}</h2>
          <p>{details}</p>
        </div>
      )}
    </div>
  );
}

export default App;