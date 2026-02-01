import { cn } from "../../utils/cn";

export const Card = ({ className, children }) => (
	<div className={cn("rounded-2xl bg-neutral-100/20 backdrop-blur border border-white/10 shadow-card-shadow", className)}>
		{children}
	</div>
);