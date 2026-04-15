import { useState } from 'react';
import './App.css';
import { BasketballAPI } from './basketballApi';
import {
  predictHighestScoringQuarter,
  calculateLowestScoringQuarter,
} from './predictionLogic';

function App() {
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [apiKey, setApiKey] = useState('');
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

  const validateInputs = () => {
    if (!apiKey.trim()) {
      setError('Please enter your API-Sports API key.');
      return false;
    }
    if (!team1.trim() || !team2.trim()) {
      setError('Please enter both team names.');
      return false;
    }
    return true;
  };

  const handlePredictHighest = async () => {
    resetMessages();
    if (!validateInputs()) return;

    setStatus('Fetching data and predicting...');

    try {
      const api = new BasketballAPI(apiKey.trim());
      const aId = await api.getTeamId(team1.trim());
      if (aId == null) {
        setError(`Data not found for ${team1}. Please check the spelling or league ID.`);
        setStatus('');
        return;
      }

      const bId = await api.getTeamId(team2.trim());
      if (bId == null) {
        setError(`Data not found for ${team2}. Please check the spelling or league ID.`);
        setStatus('');
        return;
      }

      const aGames = await api.getLastGames(aId);
      if (!aGames.length) {
        setError(`Data not found for ${team1}. Please check the spelling or league ID.`);
        setStatus('');
        return;
      }

      const bGames = await api.getLastGames(bId);
      if (!bGames.length) {
        setError(`Data not found for ${team2}. Please check the spelling or league ID.`);
        setStatus('');
        return;
      }

      const h2hGames = await api.getH2hGames(aId, bId);
      const { predictedQuarter, confidence } = predictHighestScoringQuarter(
        aGames,
        bGames,
        h2hGames
      );

      setResult(`Predicted highest scoring quarter: ${predictedQuarter}`);
      setDetails(`Confidence: ${(confidence * 100).toFixed(0)}%`);
      setStatus('');
    } catch (err) {
      setError(`An unexpected error occurred: ${err?.message ?? err}`);
      setStatus('');
    }
  };

  const handlePredictLowest = async () => {
    resetMessages();
    if (!validateInputs()) return;

    setStatus('Fetching data and calculating...');
    try {
      const api = new BasketballAPI(apiKey.trim());
      const aId = await api.getTeamId(team1.trim());
      if (aId == null) {
        setError(`Data not found for ${team1}. Please check the spelling or league ID.`);
        setStatus('');
        return;
      }

      const bId = await api.getTeamId(team2.trim());
      if (bId == null) {
        setError(`Data not found for ${team2}. Please check the spelling or league ID.`);
        setStatus('');
        return;
      }

      const h2hGames = await api.getH2hGames(aId, bId);
      let gamesToAnalyze = h2hGames;
      let source = 'head-to-head matches';

      if (!h2hGames.length) {
        const aGames = await api.getLastGames(aId);
        if (!aGames.length) {
          setError(`Data not found for ${team1}. Please check the spelling or league ID.`);
          setStatus('');
          return;
        }
        gamesToAnalyze = aGames;
        source = `${team1}'s recent games`;
      }

      const { lowestQuarter, averagePoints } = calculateLowestScoringQuarter(gamesToAnalyze);
      if (!lowestQuarter) {
        setError('Unable to calculate lowest scoring quarter. Invalid or incomplete game data.');
        setStatus('');
        return;
      }

      setResult(`Lowest scoring quarter: ${lowestQuarter}`);
      setDetails(`Average points per game: ${averagePoints.toFixed(1)} (${source})`);
      setStatus('');
    } catch (err) {
      setError(`An unexpected error occurred: ${err?.message ?? err}`);
      setStatus('');
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Basketball Highest Scoring Quarter Predictor</h1>
      </header>

      <section className="form-panel">
        <label>
          API-Sports API Key
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
        </label>

        <div className="teams-row">
          <label>
            Team 1
            <input
              type="text"
              value={team1}
              onChange={(e) => setTeam1(e.target.value)}
              placeholder="e.g., Los Angeles Lakers"
            />
          </label>

          <div className="versus">VS</div>

          <label>
            Team 2
            <input
              type="text"
              value={team2}
              onChange={(e) => setTeam2(e.target.value)}
              placeholder="e.g., Boston Celtics"
            />
          </label>
        </div>

        <div className="button-row">
          <button onClick={handlePredictHighest}>Predict Highest Scoring Quarter</button>
          <button onClick={handlePredictLowest}>Predict Lowest Scoring Quarter</button>
        </div>
      </section>

      {status && <div className="status">{status}</div>}
      {error && <div className="error">{error}</div>}
      {result && (
        <div className="output">
          <p>{result}</p>
          {details && <p>{details}</p>}
        </div>
      )}

      <footer>
        <p>
          Note: Get your API key from <a href="https://api-sports.io/" target="_blank" rel="noreferrer">API-Sports</a>.
        </p>
      </footer>
    </div>
  );
}

export default App;
