import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../utils/cn";

export const Modal = ({ open, onOpenChange, title, children, className }) => {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<AnimatePresence>
				{open ? (
					<Dialog.Portal forceMount>
						<Dialog.Overlay asChild>
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="fixed inset-0 bg-black/70"
							/>
						</Dialog.Overlay>
						<Dialog.Content asChild>
							<motion.div
								initial={{ opacity: 0, y: 8, scale: 0.98 }}
								animate={{ opacity: 1, y: 0, scale: 1 }}
								exit={{ opacity: 0, y: 8, scale: 0.98 }}
								transition={{ duration: 0.25, ease: "easeOut" }}
								className={cn(
									"fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-neutral-100/20 p-6 backdrop-blur shadow-3xl",
									className
								)}
							>
								<div className="flex items-center justify-between">
									<Dialog.Title className="text-lg font-semibold">
										{title}
									</Dialog.Title>
									<Dialog.Close asChild>
										<button aria-label="Close" className="rounded-full p-2 hover:bg-white/10">
											<X className="h-5 w-5" />
										</button>
									</Dialog.Close>
								</div>
								<div className="mt-4">{children}</div>
							</motion.div>
						</Dialog.Content>
					</Dialog.Portal>
				) : null}
			</AnimatePresence>
		</Dialog.Root>
	);
};