import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Modal } from "@/components/ui/modal";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { Check, ChevronsUpDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface ChampionTeamModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectTeam: (teamId: string) => void;
}

export function ChampionTeamModal({
	isOpen,
	onClose,
	onSelectTeam,
}: ChampionTeamModalProps) {
	const [teams, setTeams] = useState<Team[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [open, setOpen] = useState(false);

	const handleCloseAndResetSelection = useCallback(() => {
		setSelectedTeam(null);
		setOpen(false);
		onClose();
	}, [onClose]);

	const loadTeams = useCallback(async () => {
		try {
			const response = await fetch("/api/teams");
			if (!response.ok) {
				throw new Error("Erro ao carregar times");
			}

			const { teams } = await response.json();
			setTeams(teams || []);
		} catch (error) {
			console.error("Erro ao carregar times:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadTeams();
	}, [loadTeams]);

	const handleConfirmSave = () => {
		if (selectedTeam) {
			setShowConfirmation(true);
		}
	};

	const handleSave = async () => {
		if (selectedTeam) {
			await onSelectTeam(selectedTeam.id);
			handleCloseAndResetSelection();
		}
	};

	if (loading) {
		return (
			<Modal
				isOpen={isOpen}
				onClose={handleCloseAndResetSelection}
				title="Escolha o campeão"
			>
				<div className="text-center py-4 text-gray-500">
					Carregando times...
				</div>
			</Modal>
		);
	}

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleCloseAndResetSelection}
			title="Escolha o campeão"
		>
			<div className="space-y-6">
				<div className="px-4">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<Button
								role="combobox"
								aria-expanded={open}
								className="w-full justify-between bg-white text-gray-900 shadow-sm border border-gray-200"
							>
								{selectedTeam ? (
									<div className="flex items-center">
										{selectedTeam.logo_url && (
											<img
												src={selectedTeam.logo_url}
												alt={selectedTeam.name}
												className="w-10 h-10 mr-2 object-contain"
											/>
										)}
										{selectedTeam.name}
									</div>
								) : (
									"Selecione um time..."
								)}
								<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							className="w-full p-1 z-[99] bg-white pointer-events-auto border border-gray-200 shadow-md"
							style={{ width: "var(--radix-popover-trigger-width)" }}
						>
							<Command>
								<CommandInput placeholder="Buscar time..." />
								<CommandList
									className="max-h-[200px] !overflow-y-auto"
									tabIndex={-1}
									onWheel={(e) => e.stopPropagation()}
								>
									<CommandEmpty>Nenhum time encontrado.</CommandEmpty>
									<CommandGroup>
										{teams.map((team) => (
											<CommandItem
												key={team.id}
												onSelect={() => {
													setSelectedTeam(team);
													setOpen(false);
												}}
											>
												<Check
													className={cn(
														"mr-2 h-4 w-4",
														selectedTeam?.id === team.id
															? "opacity-100"
															: "opacity-0",
													)}
												/>
												{team.logo_url && (
													<img
														src={team.logo_url}
														alt={team.name}
														className="w-6 h-6 mr-2 object-contain"
													/>
												)}
												{team.name}
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
				</div>

				{!showConfirmation ? (
					<div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
						<Button
							variant="default"
							onClick={handleCloseAndResetSelection}
							className="px-6 w-32 bg-gray-200 text-gray-900 hover:bg-gray-300"
						>
							Cancelar
						</Button>
						<Button
							onClick={handleConfirmSave}
							className={`px-6 w-32 bg-black text-white font-bold ${
								!selectedTeam
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-gray-800"
							}`}
							disabled={!selectedTeam}
						>
							Salvar Palpite
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
								className="px-6 w-32 bg-red-400 text-white font-bold hover:bg-red-600"
							>
								Sim, Salvar
							</Button>
						</div>
					</div>
				)}
			</div>
		</Modal>
	);
}
