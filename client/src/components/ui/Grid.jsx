import { cn } from "../../utils/cn";

export const SectionHeader = ({ title, subtitle, action }) => (
	<div className="mb-4 flex items-end justify-between">
		<div>
			<h2 className="text-xl font-semibold">{title}</h2>
			{subtitle ? <p className="text-sm text-white/60">{subtitle}</p> : null}
		</div>
		{action}
	</div>
);

export const CardGrid = ({ children, className }) => (
	<div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
		{children}
	</div>
);