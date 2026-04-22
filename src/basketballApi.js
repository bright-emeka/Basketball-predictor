export class BasketballAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://v1.basketball.api-sports.io';
    this.headers = {
      'x-apisports-key': this.apiKey,
      'x-rapidapi-host': 'v1.basketball.api-sports.io',
    };
  }

  /**
   * Searches for a team ID by name.
   * Note: This searches across all leagues.
   */
  async getTeamId(teamName) {
    try {
      const response = await fetch(`${this.baseUrl}/teams?search=${encodeURIComponent(teamName)}`, {
        method: 'GET',
        headers: this.headers,
      });
      const data = await response.json();

      if (data.response && data.response.length > 0) {
        // We take the first match. You could refine this to check for specific leagues.
        return data.response[0].id;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching team ID for ${teamName}:`, error);
      throw error;
    }
  }

  /**
   * Fetches the last 'n' games for a specific team.
   */
  async getLastGames(teamId, limit = 10) {
    try {
      const response = await fetch(`${this.baseUrl}/games?team=${teamId}&last=${limit}`, {
        method: 'GET',
        headers: this.headers,
      });
      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error(`Error fetching last games for team ${teamId}:`, error);
      return [];
    }
  }

  /**
   * Fetches Head-to-Head games between two teams.
   */
  async getH2hGames(teamAId, teamBId) {
    try {
      const response = await fetch(`${this.baseUrl}/games?h2h=${teamAId}-${teamBId}`, {
        method: 'GET',
        headers: this.headers,
      });
      const data = await response.json();
      return data.response || [];
    } catch (error) {
      console.error(`Error fetching H2H games for ${teamAId} and ${teamBId}:`, error);
      return [];
    }
  }
}