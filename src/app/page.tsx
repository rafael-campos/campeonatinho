"use client";

import { GameList } from "@/components/games/game-list";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { BrazilianTeamBet } from "@/components/predictions/brazilian-team-bet";
import { ChampionTeamBet } from "@/components/predictions/champion-team-bet";
import { PredictionModal } from "@/components/predictions/prediction-modal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-client";
import { GameWithTeams } from "@/types/game";
import { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

type UserGuess = {
	home_guess: number;
	away_guess: number;
};

export default function HomePage() {
	const router = useRouter();

	const [games, setGames] = useState<GameWithTeams[]>([]);
	const [userGuesses, setUserGuesses] = useState<Record<string, UserGuess>>({});
	const [loading, setLoading] = useState(true);
	const [selectedGame, setSelectedGame] = useState<GameWithTeams | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<User | null>(null);

	useEffect(() => {
		const loadData = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!user) {
					router.push("/login");
					return;
				}

				setCurrentUser(user);

				// Carregar jogos com informações dos times
				const { data: gamesData, error: gamesError } = await supabase
					.from("games")
					.select(`
						*,
						home_team:teams!games_home_team_id_fkey(*),
						away_team:teams!games_away_team_id_fkey(*)
					`)
					.order("game_time", { ascending: true });

				if (gamesError) throw gamesError;

				// Carregar palpites do usuário
				const { data: guessesData, error: guessesError } = await supabase
					.from("guesses")
					.select("*")
					.eq("user_id", user.id);

				if (guessesError) throw guessesError;

				// Transformar palpites em um objeto para fácil acesso
				const guessesMap = guessesData.reduce(
					(acc, guess) => {
						acc[guess.game_id] = {
							home_guess: guess.home_guess,
							away_guess: guess.away_guess,
						};
						return acc;
					},
					{} as Record<string, UserGuess>,
				);

				setGames(gamesData || []);
				setUserGuesses(guessesMap);
			} catch (error) {
				console.error("Erro ao carregar dados:", error);
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [router]);

	const handleGuess = (gameId: string) => {
		const game = games.find((g) => g.id === gameId);
		if (game) {
			setSelectedGame(game);
			setIsModalOpen(true);
		}
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedGame(null);
	};

	const handleSaveGuess = (homeGuess: number, awayGuess: number) => {
		if (!selectedGame) return;

		setUserGuesses((prevGuesses) => ({
			...prevGuesses,
			[selectedGame.id]: {
				home_guess: homeGuess,
				away_guess: awayGuess,
			},
		}));
		router.refresh();
	};

	const handleSignOut = async () => {
		const { error } = await supabase.auth.signOut();
		if (error) {
			console.error("Erro ao sair:", error.message);
		} else {
			router.push("/login");
			router.refresh();
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-xl text-gray-900 font-medium">Carregando...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
					<h1 className="text-2xl font-bold text-gray-900">Palp.it</h1>
					<div className="flex items-center gap-4">
						{currentUser && (
							<div className="flex items-center gap-2">
								<div className="relative w-8 h-8">
									{currentUser.user_metadata.avatar_url ? (
										<Image
											src={currentUser.user_metadata.avatar_url}
											alt={currentUser.user_metadata.name || "Avatar"}
											fill
											className="rounded-full object-cover"
										/>
									) : (
										<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
											<span className="text-gray-500 text-sm">
												{currentUser.user_metadata.name?.[0]?.toUpperCase() ||
													"?"}
											</span>
										</div>
									)}
								</div>
								<span className="text-gray-900 font-medium">
									{currentUser.user_metadata.name || "Usuário"}
								</span>
							</div>
						)}
						<Button
							onClick={handleSignOut}
							variant="destructive"
							className="py-2 px-4 text-lg text-gray-900 font-bold"
						>
							<LogOut />
						</Button>
					</div>
				</div>
			</header>

			<main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8 min-h-dvh">
				<Suspense fallback={<div>Carregando params...</div>}>
					<GameList
						games={games}
						userGuesses={userGuesses}
						onGuess={handleGuess}
						currentUserId={currentUser?.id ?? null}
					/>
				</Suspense>
				<LeaderboardTable />
				<div className="grid grid-cols-1 md:grid-cols-2 my-6 mt-10 gap-6 p-4 md:p-0 pt-2">
					<BrazilianTeamBet currentUserId={currentUser?.id ?? null} />
					<ChampionTeamBet currentUserId={currentUser?.id ?? null} />
				</div>
			</main>

			<footer className="bg-white shadow-sm border-t border-gray-200 w-full z-[4] py-4">
				<div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center flex-col md:flex-row gap-2">
					<p className="text-sm text-gray-600">
						© 2025 Palp.it - Todos os direitos reservados
					</p>
					<p className="text-sm text-gray-600">
						O palmeiras não tem mundial! 🏆
					</p>
				</div>
			</footer>

			<PredictionModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				selectedGame={selectedGame}
				onSaveGuess={handleSaveGuess}
				userGuesses={userGuesses}
				currentUserId={currentUser?.id ?? null}
			/>
		</div>
	);
}
