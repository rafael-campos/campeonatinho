import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface GameHeaderProps {
	date: Date;
	onPreviousDay: () => void;
	onNextDay: () => void;
	hasPreviousDay: boolean;
	hasNextDay: boolean;
}

export function GameHeader({
	date,
	onPreviousDay,
	onNextDay,
	hasPreviousDay,
	hasNextDay,
}: GameHeaderProps) {
	return (
		<div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
			<Button
				variant="ghost"
				onClick={onPreviousDay}
				disabled={!hasPreviousDay}
				className="p-2 text-gray-700 hover:text-gray-900 disabled:text-gray-400"
			>
				<ChevronLeft className="h-6 w-6" />
			</Button>

			<h2 className="text-xl font-bold text-gray-900">
				{date.toLocaleDateString("pt-BR", {
					weekday: "long",
					day: "2-digit",
					month: "long",
				})}
			</h2>

			<Button
				variant="ghost"
				onClick={onNextDay}
				disabled={!hasNextDay}
				className="p-2 text-gray-700 hover:text-gray-900 disabled:text-gray-400"
			>
				<ChevronRight className="h-6 w-6" />
			</Button>
		</div>
	);
}
