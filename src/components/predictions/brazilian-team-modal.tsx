import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface BrazilianTeamModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectTeam: (teamId: string) => void;
}

export function BrazilianTeamModal({
	isOpen,
	onClose,
	onSelectTeam,
}: BrazilianTeamModalProps) {
	const router = useRouter();
	const [teams, setTeams] = useState<Team[]>([]);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [loading, setLoading] = useState(false);
	const [userBetTeamId, setUserBetTeamId] = useState<string | null>(null);

	useEffect(() => {
		const loadTeamsAndUserBet = async () => {
			try {
				const response = await fetch("/api/brazilian-teams");
				if (!response.ok) {
					throw new Error("Erro ao carregar dados");
				}

				const { teams: teamsData, userBetTeamId: currentUserBetTeamId } =
					await response.json();
				setTeams(teamsData);
				setUserBetTeamId(currentUserBetTeamId);
			} catch (error) {
				console.error("Erro ao carregar dados:", error);
			}
		};

		loadTeamsAndUserBet();
	}, []);

	useEffect(() => {
		if (isOpen && userBetTeamId && teams.length > 0) {
			const initialSelectedTeam = teams.find(
				(team) => team.id === userBetTeamId,
			);
			if (initialSelectedTeam) {
				setSelectedTeam(initialSelectedTeam);
			}
		}
	}, [isOpen, userBetTeamId, teams]);

	const handleConfirmSave = () => {
		setShowConfirmation(true);
	};

	const handleSave = async () => {
		if (!selectedTeam) return;

		setLoading(true);

		try {
			const response = await fetch("/api/brazil-bet", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					team_id: selectedTeam.id,
				}),
			});

			if (!response.ok) {
				throw new Error("Erro ao salvar palpite");
			}

			onSelectTeam(selectedTeam.id);
			router.refresh();
			onClose();
		} catch (error) {
			console.error("Erro ao salvar palpite:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Escolha o time brasileiro">
			<div className="space-y-6">
				<div className="grid grid-cols-2 gap-4 px-4">
					{teams.map((team) => (
						<button
							type="button"
							key={team.id}
							onClick={() => setSelectedTeam(team)}
							className={`flex flex-col items-center space-y-4 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
								selectedTeam?.id === team.id
									? "border-blue-500 bg-blue-50"
									: "border-gray-200 hover:bg-gray-50"
							}`}
						>
							{team.logo_url && (
								<img
									src={team.logo_url}
									alt={team.name}
									className="w-16 h-16 object-contain"
								/>
							)}
							<p className="font-semibold text-black text-center">
								{team.name}
							</p>
						</button>
					))}
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
							className={`px-6 w-32 bg-black text-white font-bold ${!selectedTeam ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"}`}
							disabled={!selectedTeam || loading}
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
							Após salvar, o palpite não poderá ser alterado.
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
								className={`px-6 w-32 bg-red-400 text-white font-bold ${!selectedTeam ? "opacity-50 cursor-not-allowed" : "hover:bg-red-600"}`}
								disabled={!selectedTeam || loading}
							>
								{loading ? "Salvando..." : "Sim, Salvar"}
							</Button>
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}
