"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GameWithTeams } from "@/types/game";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PredictionModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedGame: GameWithTeams | null;
	onSaveGuess: (homeGuess: number, awayGuess: number) => void;
	userGuesses: Record<string, { home_guess: number; away_guess: number }>;
	currentUserId: string | null;
}

export type GuessWithProfile =
	Database["public"]["Tables"]["guesses"]["Row"] & {
		profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
	};

export function PredictionModal({
	isOpen,
	onClose,
	selectedGame,
	onSaveGuess,
	userGuesses,
	currentUserId,
}: PredictionModalProps) {
	const router = useRouter();

	const [homeGuessInput, setHomeGuessInput] = useState<number | "">("");
	const [awayGuessInput, setAwayGuessInput] = useState<number | "">("");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [loading, setLoading] = useState(false);

	const isSaveDisabled = homeGuessInput === "" || awayGuessInput === "";

	useEffect(() => {
		if (selectedGame && userGuesses[selectedGame.id]) {
			setHomeGuessInput(userGuesses[selectedGame.id].home_guess);
			setAwayGuessInput(userGuesses[selectedGame.id].away_guess);
		} else {
			setHomeGuessInput("");
			setAwayGuessInput("");
		}
		setShowConfirmation(false);
	}, [selectedGame, userGuesses]);

	const handleConfirmSave = () => {
		setShowConfirmation(true);
	};

	const handleSave = async () => {
		if (!selectedGame) return;

		setLoading(true);

		if (!currentUserId) {
			console.error("Usuário não autenticado. ID de usuário ausente.");
			onClose();
			return;
		}

		try {
			const response = await fetch("/api/guesses", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					game_id: selectedGame.id,
					home_guess: Number(homeGuessInput),
					away_guess: Number(awayGuessInput),
				}),
			});

			if (!response.ok) {
				throw new Error("Erro ao salvar palpite");
			}

			onSaveGuess(Number(homeGuessInput), Number(awayGuessInput));
			router.refresh();
		} catch (error) {
			console.error("Erro ao salvar palpite:", error);
		} finally {
			setLoading(false);
			onClose();
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Palpitar">
			{selectedGame && (
				<div className="space-y-6">
					<div className="flex items-center justify-between gap-8 px-4">
						<div className="flex-1 flex flex-col items-center space-y-4">
							<div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
								{selectedGame.home_team.logo_url && (
									<img
										src={selectedGame.home_team.logo_url}
										alt={selectedGame.home_team.name}
										className="w-12 h-12 object-contain"
									/>
								)}
							</div>
							<p className="font-semibold text-gray-900 h-14 flex items-center justify-center text-center">
								{selectedGame.home_team.name}
							</p>
							<input
								type="number"
								min="0"
								value={homeGuessInput}
								onChange={(e) => setHomeGuessInput(Number(e.target.value))}
								className="w-20 h-12 text-center border-2 border-gray-400 rounded-lg text-lg font-bold text-gray-800 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								placeholder="-"
							/>
						</div>

						<div className="flex flex-col items-center justify-center">
							<span className="text-2xl font-bold text-gray-400">x</span>
						</div>

						<div className="flex-1 flex flex-col items-center space-y-4">
							<div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
								{selectedGame.away_team.logo_url && (
									<img
										src={selectedGame.away_team.logo_url}
										alt={selectedGame.away_team.name}
										className="w-12 h-12 object-contain"
									/>
								)}
							</div>
							<p className="font-semibold text-gray-900 h-14 flex items-center justify-center text-center">
								{selectedGame.away_team.name}
							</p>
							<input
								type="number"
								min="0"
								value={awayGuessInput}
								onChange={(e) => setAwayGuessInput(Number(e.target.value))}
								className="w-20 h-12 text-center border-2 border-gray-400 rounded-lg text-lg font-bold text-gray-800 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								placeholder="-"
							/>
						</div>
					</div>

					{!showConfirmation ? (
						<div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
							<Button
								variant="default"
								onClick={onClose}
								className="px-6 w-32 bg-gray-200 text-gray-900 hover:bg-gray-300"
							>
								Cancelar
							</Button>
							<Button
								onClick={handleConfirmSave}
								className={`px-6 w-32 bg-black text-white font-bold ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
								disabled={isSaveDisabled || loading}
							>
								{loading ? "Salvando..." : "Salvar Palpite"}
							</Button>
						</div>
					) : (
						<div className="space-y-4 pt-4 border-t border-gray-100 text-center">
							<p className="text-lg font-semibold text-gray-800">
								Tem certeza que deseja salvar este palpite?
							</p>
							<p className="text-sm text-gray-600">
								Lembrando que o palpite só pode ser alterado até 1 hora antes da
								partida.
							</p>
							<div className="flex justify-center gap-3 mt-6">
								<Button
									variant="default"
									onClick={() => setShowConfirmation(false)}
									className="px-6 bg-gray-200 text-gray-900 hover:bg-gray-300 w-32"
								>
									Não
								</Button>
								<Button
									onClick={handleSave}
									className={`px-6 w-32 bg-red-400 text-white font-bold ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
									disabled={isSaveDisabled || loading}
								>
									{loading ? "Salvando..." : "Sim, Salvar"}
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</Modal>
	);
}
