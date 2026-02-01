import { cn } from "../../utils/cn";

export const Field = ({ label, children, hint }) => (
	<div className="space-y-2">
		{label ? <label className="block text-sm text-white/80">{label}</label> : null}
		{children}
		{hint ? <p className="text-xs text-white/50">{hint}</p> : null}
	</div>
);

const baseInput = "w-full rounded-2xl border border-white/10 bg-neutral-100/20 px-4 py-3 text-sm placeholder:text-white/40 outline-none focus:ring-2 focus:ring-brand/60";

export const Input = (props) => <input {...props} className={cn(baseInput, props.className)} />;
export const Textarea = (props) => <textarea {...props} className={cn(baseInput, "min-h-[120px]", props.className)} />;
export const Select = ({ children, className, ...props }) => (
	<select className={cn(baseInput, className)} {...props}>
		{children}
	</select>
);