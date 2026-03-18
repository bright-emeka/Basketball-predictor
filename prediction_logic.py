from typing import Dict, List, Optional, Tuple

GameData = Dict[str, int]  # e.g., {'Q1': 25, 'Q2': 30, 'Q3': 28, 'Q4': 32}

class Team:
    def __init__(self, name: str, team_id: int, last_games: List[GameData]):
        self.name = name
        self.team_id = team_id
        self.last_games = last_games

class Matchup:
    def __init__(self, team_a: Team, team_b: Team, h2h_games: Optional[List[GameData]] = None):
        self.team_a = team_a
        self.team_b = team_b
        self.h2h_games = h2h_games

def get_highest_scoring_quarter(games: List[GameData]) -> str:
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    counts = {'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0}
    for game in games:
        if not all(q in game for q in quarters):
            raise ValueError("Game data missing quarter scores")
        max_quarter = max(game, key=game.get)
        counts[max_quarter] += 1
    # Tie-breaker: earliest quarter
    max_count = max(counts.values())
    candidates = [q for q in quarters if counts[q] == max_count]
    return min(candidates, key=lambda q: quarters.index(q))

def predict_highest_scoring_quarter(matchup: Matchup) -> Tuple[str, float]:
    quarters = ['Q1', 'Q2', 'Q3', 'Q4']
    a_counts = {'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0}
    for game in matchup.team_a.last_games:
        max_q = get_highest_scoring_quarter([game])
        a_counts[max_q] += 1
    b_counts = {'Q1': 0, 'Q2': 0, 'Q3': 0, 'Q4': 0}
    for game in matchup.team_b.last_games:
        max_q = get_highest_scoring_quarter([game])
        b_counts[max_q] += 1
    combined_counts = {q: a_counts[q] + b_counts[q] for q in quarters}
    if matchup.h2h_games:
        h2h_quarter = get_highest_scoring_quarter(matchup.h2h_games)
        combined_counts[h2h_quarter] += 0.3  # 30% bonus weight
    # Find predicted quarter
    max_count = max(combined_counts.values())
    candidates = [q for q in quarters if combined_counts[q] == max_count]
    predicted = min(candidates, key=lambda q: quarters.index(q))
    total_counts = sum(combined_counts.values())
    confidence = max_count / total_counts if total_counts > 0 else 0.0
    return predicted, confidence