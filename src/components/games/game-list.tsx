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

	// Array de datas únicas dos jogos, ordenadas
	const uniqueGameDates = Array.from(
		new Set(games.map((game) => {
			const d = new Date(game.game_time);
			d.setHours(0, 0, 0, 0);
			return d.getTime();
		}))
	)
		.sort((a, b) => a - b)
		.map((t) => new Date(t));

	// Função para encontrar o índice da data atual
	const currentIndex = uniqueGameDates.findIndex((d) => d.getTime() === currentDate.setHours(0, 0, 0, 0));

	const hasPreviousDay = currentIndex > 0;
	const hasNextDay = currentIndex < uniqueGameDates.length - 1;

	const handlePreviousDay = () => {
		if (hasPreviousDay) {
			handleDateChange(uniqueGameDates[currentIndex - 1]);
		}
	};

	const handleNextDay = () => {
		if (hasNextDay) {
			handleDateChange(uniqueGameDates[currentIndex + 1]);
		}
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
				{(currentDate.getDate() === 4 || currentDate.getDate() === 5) && currentDate.getMonth() === 6 && (
					<div className="text-center text-lg font-bold text-gray-800 mb-2">Quartas de Final</div>
				)}
				{(currentDate.getDate() === 28 || currentDate.getDate() === 29 || currentDate.getDate() === 30) && currentDate.getMonth() === 5 && (
					<div className="text-center text-lg font-bold text-gray-800 mb-2">Oitavas de Final</div>
				)}
				{(currentDate.getDate() === 1 && currentDate.getMonth() === 6) && (
					<div className="text-center text-lg font-bold text-gray-800 mb-2">Oitavas de Final</div>
				)}
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
