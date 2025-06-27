import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChampionTeamModal } from "./champion-team-modal";

type Team = Database["public"]["Tables"]["teams"]["Row"];
type ChampionBet = Database["public"]["Tables"]["champion_bet"]["Row"] & {
	team: Team;
	user: {
		avatar_url: string | null;
		name: string | null;
	};
};

interface ChampionTeamBetProps {
	currentUserId: string | null;
}

interface GroupedBet {
	team: Team;
	users: Array<{
		avatar_url: string | null;
		name: string | null;
	}>;
}

export function ChampionTeamBet({ currentUserId }: ChampionTeamBetProps) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [groupedBets, setGroupedBets] = useState<GroupedBet[]>([]);
	const [loading, setLoading] = useState(true);
	const [userHasBet, setUserHasBet] = useState(false);

	const isBettingOpen = () => {
		const deadline = new Date("2025-06-18T23:59:59-03:00");
		const now = new Date();
		return now.getTime() <= deadline.getTime();
	};

	const loadBets = useCallback(async () => {
		try {
			const response = await fetch("/api/champion-bet");
			if (!response.ok) {
				throw new Error("Erro ao carregar palpites");
			}

			const { data } = await response.json();
			const bets = data || [];

			// Agrupar palpites por time
			const grouped = bets.reduce((acc: GroupedBet[], bet: ChampionBet) => {
				const existingTeam = acc.find((group) => group.team.id === bet.team.id);

				if (existingTeam) {
					existingTeam.users.push(bet.user);
				} else {
					acc.push({
						team: bet.team,
						users: [bet.user],
					});
				}

				return acc;
			}, []);

			// Ordenar por número de votos (decrescente)
			grouped.sort(
				(a: GroupedBet, b: GroupedBet) => b.users.length - a.users.length,
			);

			setGroupedBets(grouped);
			setUserHasBet(
				bets.some((bet: ChampionBet) => bet.user_id === currentUserId),
			);
		} catch (error) {
			console.error("Erro ao carregar palpites:", error);
		} finally {
			setLoading(false);
		}
	}, [currentUserId]);

	useEffect(() => {
		loadBets();
	}, [loadBets]);

	const handleSelectTeam = async (teamId: string) => {
		if (!currentUserId) return;

		try {
			const response = await fetch("/api/champion-bet", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					team_id: teamId,
				}),
			});

			if (!response.ok) {
				throw new Error("Erro ao salvar palpite");
			}

			await loadBets();
			setIsModalOpen(false);
		} catch (error) {
			console.error("Erro ao salvar palpite:", error);
		}
	};

	if (loading) {
		return (
			<div className="text-center py-4 text-gray-500">
				Carregando palpites...
			</div>
		);
	}

	return (
		<div className="w-full">
			<div className="bg-white rounded-lg shadow-sm border border-gray-200">
				<div className="flex justify-between items-center p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">
						🏆 Campeão da Copa
					</h2>
					{currentUserId && !userHasBet && isBettingOpen() && (
						<Button
							onClick={() => setIsModalOpen(true)}
							className="bg-gray-700 hover:bg-gray-900 font-bold"
						>
							Fazer Palpite
						</Button>
					)}
					{!isBettingOpen() && (
						<span className="text-sm text-gray-500">
							Período de palpites encerrado
						</span>
					)}
				</div>

				{groupedBets.length === 0 ? (
					<div className="text-center text-gray-500 py-8">
						Ninguém fez palpite ainda. Seja o primeiro!
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{groupedBets.map((group) => (
							<div key={group.team.id} className="p-4 hover:bg-gray-50">
								<div className="flex items-center gap-4 mb-3">
									{group.team.logo_url && (
										<Image
											src={group.team.logo_url}
											alt={group.team.name}
											width={40}
											height={40}
											className="object-contain h-10"
										/>
									)}
									<div>
										<p className="font-bold text-gray-900">{group.team.name}</p>
										<p className="text-sm text-gray-500">
											{group.users.length}{" "}
											{group.users.length === 1 ? "voto" : "votos"}
										</p>
									</div>
								</div>
								<div className="pl-14 space-y-2">
									{group.users.map((user) => (
										<div
											key={user.name}
											className="flex items-center gap-2 text-sm text-gray-500"
										>
											{user.avatar_url && (
												<Image
													src={user.avatar_url}
													alt={user.name || "Usuário"}
													width={20}
													height={20}
													className="rounded-full"
												/>
											)}
											<span>{user.name || "Usuário"}</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{currentUserId && !userHasBet && (
				<ChampionTeamModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSelectTeam={handleSelectTeam}
				/>
			)}
		</div>
	);
}
