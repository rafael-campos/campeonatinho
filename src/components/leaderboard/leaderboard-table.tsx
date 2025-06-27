"use client";

import { Database } from "@/types/supabase";
import Image from "next/image";
import { useEffect, useState } from "react";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface LeaderboardEntry {
	profile: Profile;
	exactScoreHits: number;
	winnerHits: number;
	totalPoints: number;
}

export function LeaderboardTable() {
	const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadLeaderboard = async () => {
			try {
				const response = await fetch("/api/leaderboard");
				if (!response.ok) {
					throw new Error("Erro ao carregar leaderboard");
				}

				const { data } = await response.json();
				setLeaderboard(data);
			} catch (error) {
				console.error("Erro ao carregar leaderboard:", error);
			} finally {
				setLoading(false);
			}
		};

		loadLeaderboard();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="text-lg text-gray-600">Carregando...</div>
			</div>
		);
	}

	// Calcula as posições considerando empates
	const actualPositions: number[] = leaderboard.reduce(
		(acc: number[], entry, index) => {
			if (index === 0) {
				acc.push(1);
			} else {
				const prevEntry = leaderboard[index - 1];
				if (entry.totalPoints === prevEntry.totalPoints) {
					acc.push(acc[index - 1]);
				} else {
					acc.push(acc[index - 1] + 1);
				}
			}
			return acc;
		},
		[],
	);

	return (
		<div className="px-4 md:px-0">
			<div className="mt-8 relative bg-white rounded-lg shadow w-full z-[1]">
				<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">
						Tabela de Pontuação
					</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th
									scope="col"
									className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								/>
								<th
									scope="col"
									className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									Usuário
								</th>
								<th
									scope="col"
									className="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									AP
								</th>
								<th
									scope="col"
									className="w-24 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									AV
								</th>
								<th
									scope="col"
									className="w-20 px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
								>
									P
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200 font-bold">
							{leaderboard.map((entry, index) => (
								<tr key={entry.profile.id} className="hover:bg-gray-50">
									<td className="w-12 pl-2 py-4 whitespace-nowrap text-xl font-bold text-gray-500 text-center">
										{actualPositions[index]}º
									</td>
									<td className="px-6 pl-2 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div className="flex-shrink-0 h-10 w-10 relative">
												{entry.profile.avatar_url ? (
													<Image
														src={entry.profile.avatar_url}
														alt={entry.profile.name || ""}
														fill
														className="rounded-full object-cover"
													/>
												) : (
													<div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
														<span className="text-gray-500 text-lg">
															{entry.profile.name?.[0]?.toUpperCase() || "?"}
														</span>
													</div>
												)}
											</div>
											<div className="ml-4">
												<div className="text-sm text-gray-900">
													{entry.profile.name?.split(' ')[0]}
												</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
										{entry.exactScoreHits}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
										{entry.winnerHits}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
										{entry.totalPoints}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<div className="-mt-4 relative text-xs text-gray-500 text-right bg-gray-50 rounded-lg shadow w-full pt-6 pb-2 z-0 px-4">
				<span>
					<b>AP:</b> Acertos de Placar
				</span>
				<span className="ml-4">
					<b>AV:</b> Acertos de Vencedor
				</span>
				<span className="ml-4">
					<b>P:</b> Pontuação
				</span>
			</div>
		</div>
	);
}
