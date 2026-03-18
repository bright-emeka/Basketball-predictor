import sys
from prediction_logic import Team, Matchup, predict_highest_scoring_quarter
from api_bridge import BasketballAPI

def predict(team_a_name: str, team_b_name: str, api_key: str = None) -> str:
    api = BasketballAPI(api_key)
    a_id = api.get_team_id(team_a_name)
    b_id = api.get_team_id(team_b_name)
    a_games = api.get_last_games(a_id)
    b_games = api.get_last_games(b_id)
    h2h_games = api.get_h2h_games(a_id, b_id)
    team_a = Team(team_a_name, a_id, a_games)
    team_b = Team(team_b_name, b_id, b_games)
    matchup = Matchup(team_a, team_b, h2h_games)
    quarter, confidence = predict_highest_scoring_quarter(matchup)
    return f"Predicted highest scoring quarter: {quarter} with confidence {confidence:.2f}"

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python main.py 'Team A' 'Team B'")
        sys.exit(1)
    try:
        result = predict(sys.argv[1], sys.argv[2])
        print(result)
    except Exception as e:
        print(f"Error: {e}")