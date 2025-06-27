import { GameWithTeams } from "@/types/game";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GameCard } from "./game-card";
import { GameHeader } from "./game-header";

interface GameListProps {
	games: GameWithTeams[];
	userGuesses: Record<string, { home_guess: number; away_guess: number }>;
	onGuess: (gameId: string) => void;
	currentUserId: string | null;
}

export function GameList({
	games,
	userGuesses,
	onGuess,
	currentUserId,
}: GameListProps) {
	const searchParams = useSearchParams();
	const router = useRouter();

	const [filteredGames, setFilteredGames] = useState(games);

	const [currentDate, setCurrentDate] = useState<Date>(() => {
		const dateParam = searchParams.get("date");
		if (dateParam) {
			// Tenta parsear a data do query param
			const date = new Date(dateParam);
			// Valida se a data é válida
			if (!Number.isNaN(date.getTime())) {
				return date;
			}
		}
		return new Date(); // Retorna a data atual se não houver param ou for inválido
	});

	const handleDateChange = (newDate: Date) => {
		setCurrentDate(newDate);
		const newSearchParams = new URLSearchParams(searchParams.toString());
		newSearchParams.set("date", newDate.toISOString().split("T")[0]); // Salva a data como YYYY-MM-DD
		router.push(`?${newSearchParams.toString()}`, { scroll: false });
	};

	useEffect(() => {
		const startOfDay = new Date(currentDate);
		startOfDay.setHours(0, 0, 0, 0);

		const endOfDay = new Date(currentDate);
		endOfDay.setHours(23, 59, 59, 999);

		const gamesForDay = games.filter((game) => {
			const gameDate = new Date(game.game_time);
			return gameDate >= startOfDay && gameDate <= endOfDay;
		});

		setFilteredGames(gamesForDay);
	}, [currentDate, games]);

	const hasPreviousDay = games.some((game) => {
		const gameDate = new Date(game.game_time);
		const startOfCurrentDate = new Date(currentDate);
		startOfCurrentDate.setHours(0, 0, 0, 0);
		return gameDate < startOfCurrentDate;
	});

	const hasNextDay = games.some((game) => {
		const gameDate = new Date(game.game_time);
		const endOfCurrentDate = new Date(currentDate);
		endOfCurrentDate.setHours(23, 59, 59, 999);
		return gameDate > endOfCurrentDate;
	});

	const handlePreviousDay = () => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() - 1);
		handleDateChange(newDate);
	};

	const handleNextDay = () => {
		const newDate = new Date(currentDate);
		newDate.setDate(newDate.getDate() + 1);
		handleDateChange(newDate);
	};

	return (
		<div className="w-full px-4 md:px-0">
			<GameHeader
				date={currentDate}
				onPreviousDay={handlePreviousDay}
				onNextDay={handleNextDay}
				hasPreviousDay={hasPreviousDay}
				hasNextDay={hasNextDay}
			/>

			<div className="space-y-4">
				{filteredGames.length > 0 ? (
					filteredGames.map((game) => (
						<GameCard
							key={game.id}
							game={game}
							userGuess={userGuesses[game.id]}
							onGuess={onGuess}
							currentUserId={currentUserId}
						/>
					))
				) : (
					<div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
						<div className="text-gray-500 text-lg mb-2">
							Nenhum jogo para este dia
						</div>
						<p className="text-gray-400">
							Selecione outro dia para ver os jogos disponíveis
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
