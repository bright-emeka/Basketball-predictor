export class BasketballAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    if (!this.apiKey) {
      throw new Error('API-Sports API key is required');
    }
    this.baseUrl = 'https://v1.basketball.api-sports.io';
    this.headers = {
      'x-apisports-key': this.apiKey,
    };
  }

  async _fetch(endpoint, params) {
    const query = params
      ? `?${new URLSearchParams(params).toString()}`
      : '';
    const response = await fetch(`${this.baseUrl}/${endpoint}${query}`, {
      headers: this.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  async getTeamId(name) {
    const data = await this._fetch('teams', { search: name });
    if (data?.results > 0 && Array.isArray(data.response)) {
      return Number(data.response[0].id);
    }
    return null;
  }

  async getLastGames(teamId, season = 2025) {
    if (teamId == null) {
      return [];
    }
    const data = await this._fetch('games', {
      team: teamId,
      season,
    });

    if (!Array.isArray(data.response)) {
      return [];
    }

    return data.response
      .map((game) => {
        const scores = game.scores || {};
        if (!scores.home || !scores.away) {
          return null;
        }
        const home = scores.home;
        const away = scores.away;
        if (
          home.quarter_1 == null ||
          home.quarter_2 == null ||
          home.quarter_3 == null ||
          home.quarter_4 == null ||
          away.quarter_1 == null ||
          away.quarter_2 == null ||
          away.quarter_3 == null ||
          away.quarter_4 == null
        ) {
          return null;
        }
        return {
          Q1: home.quarter_1 + away.quarter_1,
          Q2: home.quarter_2 + away.quarter_2,
          Q3: home.quarter_3 + away.quarter_3,
          Q4: home.quarter_4 + away.quarter_4,
        };
      })
      .filter(Boolean);
  }

  async getH2hGames(teamAId, teamBId) {
    if (teamAId == null || teamBId == null) {
      return [];
    }
    const data = await this._fetch('games', {
      h2h: `${teamAId}-${teamBId}`,
    });

    if (!Array.isArray(data.response)) {
      return [];
    }

    return data.response
      .map((game) => {
        const scores = game.scores || {};
        if (!scores.home || !scores.away) {
          return null;
        }
        const home = scores.home;
        const away = scores.away;
        if (
          home.quarter_1 == null ||
          home.quarter_2 == null ||
          home.quarter_3 == null ||
          home.quarter_4 == null ||
          away.quarter_1 == null ||
          away.quarter_2 == null ||
          away.quarter_3 == null ||
          away.quarter_4 == null
        ) {
          return null;
        }
        return {
          Q1: home.quarter_1 + away.quarter_1,
          Q2: home.quarter_2 + away.quarter_2,
          Q3: home.quarter_3 + away.quarter_3,
          Q4: home.quarter_4 + away.quarter_4,
        };
      })
      .filter(Boolean);
  }
}
