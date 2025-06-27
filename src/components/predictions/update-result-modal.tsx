import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GameWithTeams } from "@/types/game";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UpdateResultModalProps {
	isOpen: boolean;
	onClose: () => void;
	selectedGame: GameWithTeams | null;
}

export function UpdateResultModal({
	isOpen,
	onClose,
	selectedGame,
}: UpdateResultModalProps) {
	const router = useRouter();
	const [homeScoreInput, setHomeScoreInput] = useState<number | "">("");
	const [awayScoreInput, setAwayScoreInput] = useState<number | "">("");
	const [loading, setLoading] = useState(false);

	const isSaveDisabled = homeScoreInput === "" || awayScoreInput === "";

	useEffect(() => {
		if (selectedGame) {
			setHomeScoreInput(selectedGame.home_score ?? "");
			setAwayScoreInput(selectedGame.away_score ?? "");
		}
	}, [selectedGame]);

	const handleSave = async () => {
		if (!selectedGame) return;

		setLoading(true);

		try {
			const response = await fetch("/api/games/update-result", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					game_id: selectedGame.id,
					home_score: Number(homeScoreInput),
					away_score: Number(awayScoreInput),
				}),
			});

			if (!response.ok) {
				throw new Error("Erro ao atualizar resultado");
			}

			// Atualiza o jogo localmente
			selectedGame.home_score = Number(homeScoreInput);
			selectedGame.away_score = Number(awayScoreInput);

			router.refresh();
			onClose();
		} catch (error) {
			console.error("Erro ao atualizar resultado:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Atualizar Resultado">
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
								value={homeScoreInput}
								onChange={(e) => setHomeScoreInput(Number(e.target.value))}
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
								value={awayScoreInput}
								onChange={(e) => setAwayScoreInput(Number(e.target.value))}
								className="w-20 h-12 text-center border-2 border-gray-400 rounded-lg text-lg font-bold text-gray-800 focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								placeholder="-"
							/>
						</div>
					</div>

					<div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
						<Button
							variant="default"
							onClick={onClose}
							className="px-6 w-32 bg-gray-200 text-gray-900 hover:bg-gray-300"
						>
							Cancelar
						</Button>
						<Button
							onClick={handleSave}
							className={`px-6 w-32 bg-black text-white font-bold ${isSaveDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
							disabled={isSaveDisabled || loading}
						>
							{loading ? "Salvando..." : "Atualizar"}
						</Button>
					</div>
				</div>
			)}
		</Modal>
	);
}
