import requests
import time
import os
from typing import List
from prediction_logic import GameData

class BasketballAPI:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or "13c1251bdfb2edb287354c625b3afe11"
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

    def get_team_id(self, name: str):
        url = f"{self.base_url}/teams?search={name}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        data = response.json()

        if data.get('results', 0) > 0 and isinstance(data.get('response'), list):
            return int(data['response'][0]['id'])
        return None

    def get_last_games(self, team_id: int, season: int = 2025):
        if team_id is None:
            return []

        team_id = int(team_id)
        season = int(season)
        url = f"{self.base_url}/games?team={team_id}&season={season}"
        response = requests.get(url, headers=self.headers)
        response.raise_for_status()
        data = response.json()

        response_list = data.get('response')
        if not isinstance(response_list, list):
            return []

        games = []
        for game in response_list:
            scores = game.get('scores', {})
            if 'home' in scores and 'quarter_1' in scores['home'] and 'away' in scores:
                game_data = {
                    'Q1': scores['home']['quarter_1'] + scores['away']['quarter_1'],
                    'Q2': scores['home']['quarter_2'] + scores['away']['quarter_2'],
                    'Q3': scores['home']['quarter_3'] + scores['away']['quarter_3'],
                    'Q4': scores['home']['quarter_4'] + scores['away']['quarter_4'],
                }
                games.append(game_data)

        return games

    def get_h2h_games(self, team_a_id: int, team_b_id: int):
        try:
            data = self._make_request("games", {"h2h": f"{int(team_a_id)}-{int(team_b_id)}"})
            response = data.get('response')
            if not isinstance(response, list):
                return []

            games = []
            for game in response:
                scores = game.get('scores', {})
                if 'home' in scores and 'quarter_1' in scores['home']:
                    game_data = {
                        'Q1': scores['home']['quarter_1'] + scores['away']['quarter_1'],
                        'Q2': scores['home']['quarter_2'] + scores['away']['quarter_2'],
                        'Q3': scores['home']['quarter_3'] + scores['away']['quarter_3'],
                        'Q4': scores['home']['quarter_4'] + scores['away']['quarter_4'],
                    }
                    games.append(game_data)
            return games
        except Exception:
            return []