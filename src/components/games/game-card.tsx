import { UpdateResultModal } from "@/components/predictions/update-result-modal";
import { cn } from "@/lib/utils";
import { GameWithTeams } from "@/types/game";
import { Tables } from "@/types/supabase";
import { Ban, ChevronDown, ChevronUp, DiamondPlus, Pen } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface GuessWithProfile extends Tables<"guesses"> {
	profiles: { name: string | null; avatar_url: string | null } | null;
}

interface GameCardProps {
	game: GameWithTeams;
	userGuess?: {
		home_guess: number;
		away_guess: number;
	} | null;
	onGuess: (gameId: string) => void;
	currentUserId: string | null;
}

export function GameCard({
	game,
	userGuess,
	onGuess,
	currentUserId,
}: GameCardProps) {
	const gameTime = new Date(game.game_time);
	const currentTime = new Date();
	const timeDifference = gameTime.getTime() - currentTime.getTime(); // Diferença em milissegundos
	const isPredictionClosed = timeDifference <= 60 * 60 * 1000; // 60 minutos em milissegundos

	const hasActualScore = game.home_score !== null && game.away_score !== null;
	const isAdmin = currentUserId === "631aa0ad-e28f-46cc-b655-bb141c04488a";
	const [isUpdateResultModalOpen, setIsUpdateResultModalOpen] = useState(false);

	const resultColorClass = "bg-gray-100"; // Cor padrão (cinza claro)
	let resultTextColorClass = "text-gray-300"; // Cor padrão do texto (cinza claro)

	const [showAllGuesses, setShowAllGuesses] = useState(false);
	const [allGuesses, setAllGuesses] = useState<GuessWithProfile[]>([]); // Estado para armazenar todos os palpites
	const [isLoadingAllGuesses, setIsLoadingAllGuesses] = useState(false);

	const [hasLoadedGuesses, setHasLoadedGuesses] = useState(false);
	const [shouldLoadGuesses, setShouldLoadGuesses] = useState(false);

	useEffect(() => {
		if (!shouldLoadGuesses || isLoadingAllGuesses) return;

		const fetchAllGuesses = async () => {
			setIsLoadingAllGuesses(true);
			try {
				const response = await fetch(`/api/game-guesses?gameId=${game.id}`);
				if (!response.ok) throw new Error("Erro ao carregar palpites");

				const { data } = await response.json();
				setAllGuesses(data || []);
				setHasLoadedGuesses(true);
			} catch (error) {
				console.error("Erro ao carregar todos os palpites:", error);
			} finally {
				setIsLoadingAllGuesses(false);
				setShouldLoadGuesses(false); // <- ZERA O TRIGGER
			}
		};

		fetchAllGuesses();
	}, [shouldLoadGuesses, isLoadingAllGuesses, game.id]);

	useEffect(() => {
		if (
			showAllGuesses &&
			!isLoadingAllGuesses &&
			!allGuesses.length &&
			!hasLoadedGuesses
		) {
			setShouldLoadGuesses(true);
		}
	}, [
		showAllGuesses,
		isLoadingAllGuesses,
		allGuesses.length,
		hasLoadedGuesses,
	]);

	if (userGuess && game.home_score !== null && game.away_score !== null) {
		const homeActual = game.home_score;
		const awayActual = game.away_score;
		const homeGuess = userGuess.home_guess;
		const awayGuess = userGuess.away_guess;

		const didGuessHomeWin = homeGuess > awayGuess;
		const didGuessAwayWin = awayGuess > homeGuess;
		const didGuessDraw = homeGuess === awayGuess;

		const didHomeWin = homeActual > awayActual;
		const didAwayWin = awayActual > homeActual;
		const didDraw = homeActual === awayActual;

		// Acertou o placar exato
		if (homeGuess === homeActual && awayGuess === awayActual) {
			resultTextColorClass = "text-emerald-200"; // Verde mais escuro
		} // Acertou o vencedor
		else if (
			(didGuessHomeWin && didHomeWin) ||
			(didGuessAwayWin && didAwayWin) ||
			(didGuessDraw && didDraw)
		) {
			resultTextColorClass = "text-amber-200"; // Amarelo mais escuro
		} // Errou tudo
		else {
			resultTextColorClass = "text-red-200"; // Vermelho mais escuro
		}
	}

	const checkValue = (value: number | null | undefined) => {
		return value !== null && value !== undefined;
	};

	function formatDisplayName(fullName?: string | null) {
		if (!fullName) return "";

		const prepositions = ["de", "da", "do", "dos", "das"];
		const parts = fullName.trim().split(/\s+/);

		if (parts.length === 0) return "";

		// Se o segundo nome for uma preposição, inclui o terceiro
		if (prepositions.includes(parts[1]?.toLowerCase())) {
			return parts.slice(0, 3).join(" ");
		}

		// Caso contrário, pega só os dois primeiros
		return parts.slice(0, 2).join(" ");
	}

	const handleOnGuess = (gameId: string) => {
		if (!isPredictionClosed) {
			onGuess(gameId);
		}
	};

	return (
		<div>
			<div className="px-12 md:px-20 relative">
				{!!userGuess && (
					<>
						<div
							className={`absolute inset-0 rounded-xl ${resultColorClass}`}
						/>

						<div
							className={`absolute left-3 top-1/2 -translate-y-1/2 text-5xl md:text-8xl font-bold ${resultTextColorClass}`}
						>
							{userGuess.home_guess}
						</div>
						<div
							className={`absolute right-3 top-1/2 -translate-y-1/2 text-5xl md:text-8xl font-bold ${resultTextColorClass}`}
						>
							{userGuess.away_guess}
						</div>
					</>
				)}

				<div
					className={cn(
						"flex items-center justify-between p-4 bg-white rounded-lg shadow-md border border-gray-200 relative z-[2] md:ml-0 md:w-full md:pl-4",
						!userGuess && "pl-[46px] w-[calc(100%_+_46px)] -ml-[46px]",
					)}
				>
					<div className="flex-1 flex items-center gap-2">
						<div className="relative w-12 h-12 flex items-center justify-center">
							<Image
								src={game.home_team.logo_url || "/placeholder.png"}
								alt={game.home_team.name}
								fill
								className="object-contain p-1"
								sizes="48px"
							/>
						</div>
						<span className="hidden sm:block font-medium text-gray-900">
							{game.home_team.name}
						</span>
					</div>

					<div className="flex flex-col items-center gap-2 mx-2 md:mx-4">
						<span className="text-xs sm:text-sm text-gray-500 font-bold">
							Placar
						</span>
						<button
							type="button"
							disabled={!isAdmin}
							onClick={() => (isAdmin ? setIsUpdateResultModalOpen(true) : {})}
							className={cn(
								"flex items-center gap-1",
								isAdmin && "cursor-pointer",
							)}
						>
							<div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
								<span
									className={`text-sm sm:text-base ${
										checkValue(game.home_score)
											? "text-gray-900 font-bold"
											: "text-gray-600"
									}`}
								>
									{checkValue(game.home_score) ? game.home_score : "-"}
								</span>
							</div>
							<span className="text-gray-400 mx-2">x</span>
							<div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
								<span
									className={`text-sm sm:text-base ${
										checkValue(game.away_score)
											? "text-gray-900 font-bold"
											: "text-gray-600"
									}`}
								>
									{checkValue(game.away_score) ? game.away_score : "-"}
								</span>
							</div>
						</button>
						<span className="text-[10px] sm:text-xs text-gray-400 mt-1 font-bold">
							{new Date(game.game_time).toLocaleTimeString("pt-BR", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					</div>

					<div className="flex-1 flex items-center justify-end gap-2">
						<span className="hidden sm:block font-medium text-gray-900">
							{game.away_team.name}
						</span>
						<div className="relative w-12 h-12 flex items-center justify-center">
							<Image
								src={game.away_team.logo_url || "/placeholder.png"}
								alt={game.away_team.name}
								fill
								className="object-contain p-1"
								sizes="48px"
							/>
						</div>
					</div>
				</div>

				{!userGuess && (
					<div className="absolute right-[6px] md:right-[38px] top-0 h-full">
						<Button
							onClick={() => handleOnGuess(game.id)}
							variant="secondary"
							title={isPredictionClosed ? "Palpites encerrados" : "Palpitar"}
							className={`bg-emerald-500 text-white font-medium h-full ${isPredictionClosed ? "opacity-50 bg-gray-500 cursor-not-allowed" : "hover:bg-emerald-600 cursor-pointer"}`}
							disabled={isPredictionClosed}
						>
							{isPredictionClosed ? (
								<Ban className="left-[6px] relative" />
							) : (
								<DiamondPlus className="left-[6px] relative" />
							)}
						</Button>
					</div>
				)}
			</div>

			<div
				className={cn(
					"mt-2 flex justify-between items-center px-1 md:px-20",
					(!userGuess || isPredictionClosed) && "justify-center",
				)}
			>
				<button
					type="button"
					onClick={() => setShowAllGuesses(!showAllGuesses)}
					className="text-gray-500 text-xs hover:text-gray-700 flex items-center justify-center bg-white px-4 py-1 shadow-sm rounded-full cursor-pointer"
				>
					{showAllGuesses ? "Mostrar menos" : "Mostrar todos os palpites"}
					{showAllGuesses ? (
						<ChevronUp className="ml-1 h-4 w-4" />
					) : (
						<ChevronDown className="ml-1 h-4 w-4" />
					)}
				</button>

				{!!userGuess && !isPredictionClosed && (
					<button
						type="button"
						onClick={() => handleOnGuess(game.id)}
						className="text-gray-500 text-xs hover:text-gray-700 flex items-center justify-center bg-white px-4 py-1 shadow-sm rounded-full cursor-pointer"
					>
						<Pen className="mr-1 h-3 w-3" />
						Editar palpite
					</button>
				)}
			</div>

			<div className="mt-2 text-center">
				<div
					className={`overflow-hidden transition-all duration-300 ease-in-out ${showAllGuesses ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
				>
					{isLoadingAllGuesses && (
						<div className="text-gray-500 text-sm">Carregando palpites...</div>
					)}
					{!isLoadingAllGuesses &&
						allGuesses.length === 0 &&
						showAllGuesses && (
							<div className="text-gray-500 text-sm">
								Nenhum outro palpite para este jogo.
							</div>
						)}
					{!isLoadingAllGuesses && allGuesses.length > 0 && showAllGuesses && (
						<div className="w-[90%] md:w-[60%] mx-auto">
							<ul className="space-y-2 pb-2">
								{allGuesses.map((guess: GuessWithProfile) => {
									let winningTeamLogoUrl: string | null = null;
									let winningTeamName: string | null = null;
									let isDrawGuess = false;

									if (guess.home_guess > guess.away_guess) {
										winningTeamLogoUrl = game.home_team.logo_url;
										winningTeamName = game.home_team.name;
									} else if (guess.away_guess > guess.home_guess) {
										winningTeamLogoUrl = game.away_team.logo_url;
										winningTeamName = game.away_team.name;
									} else {
										// Palpite de empate
										isDrawGuess = true;
									}

									let guessCardBgColor = "bg-gray-100";
									let cardShadowClass = "shadow-sm";
									let cardBorderClass = "border border-gray-200";

									if (game.home_score !== null && game.away_score !== null) {
										const homeActual = game.home_score;
										const awayActual = game.away_score;
										const homeGuess = guess.home_guess;
										const awayGuess = guess.away_guess;

										const didGuessHomeWin = homeGuess > awayGuess;
										const didGuessAwayWin = awayGuess > homeGuess;
										const didGuessDraw = homeGuess === awayGuess;

										const didHomeWin = homeActual > awayActual;
										const didAwayWin = awayActual > homeActual;
										const didDraw = homeActual === awayActual;

										// Acertou o placar exato
										if (homeGuess === homeActual && awayGuess === awayActual) {
											guessCardBgColor = "bg-green-100/40"; // Verde com 40% de opacidade
											cardShadowClass = ""; // Sem sombra
											cardBorderClass = "border border-green-500"; // Borda verde forte
										} // Acertou o vencedor
										else if (
											(didGuessHomeWin && didHomeWin) ||
											(didGuessAwayWin && didAwayWin) ||
											(didGuessDraw && didDraw)
										) {
											guessCardBgColor = "bg-yellow-100/40"; // Amarelo com 40% de opacidade
											cardShadowClass = ""; // Sem sombra
											cardBorderClass = "border border-yellow-500"; // Borda amarela forte
										} // Errou tudo
										else {
											guessCardBgColor = "bg-red-100/40"; // Vermelho com 40% de opacidade
											cardShadowClass = ""; // Sem sombra
											cardBorderClass = "border border-red-500"; // Borda vermelha forte
										}
									}

									return (
										<li
											key={guess.id}
											className={`flex justify-between items-center text-sm text-gray-700 py-1 ${guessCardBgColor} p-3 rounded-lg ${cardShadowClass} ${cardBorderClass} gap-4`}
										>
											<div className="flex items-center">
												<div className="relative w-6 h-6 flex-shrink-0">
													{isDrawGuess ? (
														<div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs">
															E
														</div>
													) : (
														winningTeamLogoUrl && (
															<Image
																src={winningTeamLogoUrl}
																alt={winningTeamName || "Time vencedor"}
																fill
																className="object-contain"
															/>
														)
													)}
												</div>
											</div>

											<div className="flex items-center gap-1 justify-center">
												<div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
													<span className="text-gray-900 font-bold">
														{guess.home_guess}
													</span>
												</div>
												<span className="text-gray-400 mx-1">x</span>
												<div className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md border border-gray-200">
													<span className="text-gray-900 font-bold">
														{guess.away_guess}
													</span>
												</div>
											</div>

											<div className="flex-1 flex items-center justify-end gap-1">
												<span
													className={
														guess.user_id === currentUserId
															? "font-bold text-right"
															: "text-right"
													}
												>
													{formatDisplayName(guess.profiles?.name)}
												</span>
												{guess.profiles?.avatar_url && (
													<Image
														src={guess.profiles.avatar_url}
														alt={guess.profiles.name || "User Avatar"}
														width={20}
														height={20}
														className="rounded-full"
													/>
												)}
											</div>
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</div>
			</div>

			{isAdmin && (
				<UpdateResultModal
					isOpen={isUpdateResultModalOpen}
					onClose={() => setIsUpdateResultModalOpen(false)}
					selectedGame={game}
				/>
			)}
		</div>
	);
}
