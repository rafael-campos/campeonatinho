export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: {
					avatar_url: string | null;
					created_at: string;
					email: string | null;
					id: string;
					name: string | null;
				};
				Insert: {
					avatar_url?: string | null;
					created_at?: string;
					email?: string | null;
					id?: string;
					name?: string | null;
				};
				Update: {
					avatar_url?: string | null;
					created_at?: string;
					email?: string | null;
					id?: string;
					name?: string | null;
				};
				Relationships: [];
			};
			teams: {
				Row: {
					id: string;
					name: string;
					logo_url: string | null;
					country: string | null;
					is_brazilian: boolean;
				};
				Insert: {
					id?: string;
					name: string;
					logo_url?: string | null;
					country?: string | null;
					is_brazilian?: boolean;
				};
				Update: {
					id?: string;
					name?: string;
					logo_url?: string | null;
					country?: string | null;
					is_brazilian?: boolean;
				};
				Relationships: [];
			};
			games: {
				Row: {
					id: string;
					home_team_id: string;
					away_team_id: string;
					game_time: string;
					home_score: number | null;
					away_score: number | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					home_team_id: string;
					away_team_id: string;
					game_time: string;
					home_score?: number | null;
					away_score?: number | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					home_team_id?: string;
					away_team_id?: string;
					game_time?: string;
					home_score?: number | null;
					away_score?: number | null;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "games_home_team_id_fkey";
						columns: ["home_team_id"];
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "games_away_team_id_fkey";
						columns: ["away_team_id"];
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			guesses: {
				Row: {
					id: string;
					user_id: string;
					game_id: string;
					home_guess: number;
					away_guess: number;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					game_id: string;
					home_guess: number;
					away_guess: number;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					game_id?: string;
					home_guess?: number;
					away_guess?: number;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "guesses_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "guesses_game_id_fkey";
						columns: ["game_id"];
						referencedRelation: "games";
						referencedColumns: ["id"];
					},
				];
			};
			brazil_bet: {
				Row: {
					id: string;
					user_id: string;
					team_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					team_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					team_id?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "brazil_bet_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "brazil_bet_team_id_fkey";
						columns: ["team_id"];
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
			champion_bet: {
				Row: {
					user_id: string;
					team_id: string;
					created_at: string;
				};
				Insert: {
					user_id: string;
					team_id: string;
					created_at?: string;
				};
				Update: {
					user_id?: string;
					team_id?: string;
					created_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "champion_bet_user_id_fkey";
						columns: ["user_id"];
						referencedRelation: "profiles";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "champion_bet_team_id_fkey";
						columns: ["team_id"];
						referencedRelation: "teams";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[keyof Database]["Tables"];
export type Tables<T extends keyof PublicSchema> = PublicSchema[T]["Row"];
export type TablesInsert<T extends keyof PublicSchema> =
	PublicSchema[T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema> =
	PublicSchema[T]["Update"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
	Database["public"]["Enums"][T];
