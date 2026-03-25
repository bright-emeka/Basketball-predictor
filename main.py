import sys
import streamlit as st
from prediction_logic import Team, Matchup, predict_highest_scoring_quarter, calculate_lowest_scoring_quarter
from api_bridge import BasketballAPI

def predict(team_a_name: str, team_b_name: str, api_key: str = None) -> str:
    api = BasketballAPI(api_key)
    a_id = api.get_team_id(team_a_name)
    if a_id is None:
        st.warning(f"Data not found for {team_a_name}. Please check the spelling or league ID.")
        return
    
    b_id = api.get_team_id(team_b_name)
    if b_id is None:
        st.warning(f"Data not found for {team_b_name}. Please check the spelling or league ID.")
        return
    
    a_games = api.get_last_games(a_id)
    if not a_games:
        st.warning(f"Data not found for {team_a_name}. Please check the spelling or league ID.")
        return
    
    b_games = api.get_last_games(b_id)
    if not b_games:
        st.warning(f"Data not found for {team_b_name}. Please check the spelling or league ID.")
        return
    
    h2h_games = api.get_h2h_games(a_id, b_id)
    team_a = Team(team_a_name, a_id, a_games)
    team_b = Team(team_b_name, b_id, b_games)
    matchup = Matchup(team_a, team_b, h2h_games)
    quarter, confidence = predict_highest_scoring_quarter(matchup)
    return f"Predicted highest scoring quarter: {quarter} with confidence {confidence:.2f}"

def predict_lowest_scoring(team_a_name: str, team_b_name: str, api_key: str = None) -> str:
    api = BasketballAPI(api_key)
    a_id = api.get_team_id(team_a_name)
    if a_id is None:
        st.warning(f"Data not found for {team_a_name}. Please check the spelling or league ID.")
        return
    
    b_id = api.get_team_id(team_b_name)
    if b_id is None:
        st.warning(f"Data not found for {team_b_name}. Please check the spelling or league ID.")
        return
    
    h2h_games = api.get_h2h_games(a_id, b_id)
    
    # Use h2h games if available, otherwise use recent games
    if h2h_games:
        games_to_analyze = h2h_games
        source = "head-to-head matches"
    else:
        a_games = api.get_last_games(a_id)
        if not a_games:
            st.warning(f"Data not found for {team_a_name}. Please check the spelling or league ID.")
            return
        games_to_analyze = a_games
        source = f"{team_a_name}'s recent games"
    
    # Calculate lowest scoring quarter
    lowest_quarter, avg_points = calculate_lowest_scoring_quarter(games_to_analyze)
    
    if lowest_quarter is None or avg_points is None:
        st.warning("Unable to calculate lowest scoring quarter. Invalid or incomplete game data.")
        return
    
    return f"Quarter: {lowest_quarter}, Avg Points: {avg_points:.1f}", source

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python main.py 'Team A' 'Team B'")
        sys.exit(1)
    try:
        result = predict(sys.argv[1], sys.argv[2])
        print(result)
    except Exception as e:
        print(f"Error: {e}")