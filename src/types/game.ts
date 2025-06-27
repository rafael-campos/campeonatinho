export interface Game {
	id: string;
	home_team_id: string;
	away_team_id: string;
	game_time: string;
	home_score: number | null;
	away_score: number | null;
	created_at: string;
}

export interface Team {
	id: string;
	name: string;
	logo_url: string | null;
}

export interface GameWithTeams extends Game {
	home_team: {
		id: string;
		name: string;
		logo_url: string | null;
		country: string | null;
		is_brazilian: boolean;
	};
	away_team: {
		id: string;
		name: string;
		logo_url: string | null;
		country: string | null;
		is_brazilian: boolean;
	};
}
