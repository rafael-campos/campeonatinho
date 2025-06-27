import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "./button";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	return (
		<Dialog.Root open={isOpen} onOpenChange={onClose}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
				<Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg w-[90vw] max-w-md z-50">
					<div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
						<Dialog.Title className="text-2xl font-bold text-gray-700">
							{title}
						</Dialog.Title>
						<Dialog.Close asChild>
							<Button variant="ghost" size="icon" className="h-8 w-8">
								<X className="h-4 w-4 text-gray-700" />
							</Button>
						</Dialog.Close>
					</div>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
