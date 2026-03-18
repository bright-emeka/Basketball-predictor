import requests
import time
import os
from typing import List
from prediction_logic import GameData

import requests
import time
import os
from typing import List
from prediction_logic import GameData

class BasketballAPI:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('API_SPORTS_KEY')
        if not self.api_key:
            raise ValueError("API_SPORTS_KEY not provided or environment variable not set")
        self.base_url = "https://v1.basketball.api-sports.io"
        self.headers = {'x-apisports-key': self.api_key}

    def _make_request(self, endpoint: str, params: dict = None) -> dict:
        url = f"{self.base_url}/{endpoint}"
        response = requests.get(url, headers=self.headers, params=params)
        time.sleep(0.6)  # Rate limiting
        response.raise_for_status()
        return response.json()

    def get_team_id(self, name: str) -> int:
        data = self._make_request("teams", {"name": name})
        if data.get('results', 0) > 0:
            return data['response'][0]['id']
        else:
            raise ValueError(f"Team '{name}' not found")

    def get_last_games(self, team_id: int, last: int = 10) -> List[GameData]:
        data = self._make_request("games", {"team": team_id, "last": last})
        games = []
        for game in data.get('response', []):
            scores = game.get('scores', {})
            if 'home' in scores and 'quarter_1' in scores['home']:
                game_data = {
                    'Q1': scores['home']['quarter_1'] + scores['away']['quarter_1'],
                    'Q2': scores['home']['quarter_2'] + scores['away']['quarter_2'],
                    'Q3': scores['home']['quarter_3'] + scores['away']['quarter_3'],
                    'Q4': scores['home']['quarter_4'] + scores['away']['quarter_4'],
                }
                games.append(game_data)
            else:
                raise ValueError("League does not support quarter breakdowns")
        return games

    def get_h2h_games(self, team_a_id: int, team_b_id: int) -> List[GameData]:
        data = self._make_request("games", {"h2h": f"{team_a_id}-{team_b_id}"})
        games = []
        for game in data.get('response', []):
            scores = game.get('scores', {})
            if 'home' in scores and 'quarter_1' in scores['home']:
                game_data = {
                    'Q1': scores['home']['quarter_1'] + scores['away']['quarter_1'],
                    'Q2': scores['home']['quarter_2'] + scores['away']['quarter_2'],
                    'Q3': scores['home']['quarter_3'] + scores['away']['quarter_3'],
                    'Q4': scores['home']['quarter_4'] + scores['away']['quarter_4'],
                }
                games.append(game_data)
            else:
                raise ValueError("League does not support quarter breakdowns")
        return games