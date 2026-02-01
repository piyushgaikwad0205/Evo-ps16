import { cn } from "../../utils/cn";

const base = "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed";

const variants = {
	filled: "bg-gradient-to-tr from-brand-gradientStart to-brand-gradientEnd hover:from-brand-700 hover:to-brand-600 shadow-3xl",
	outline: "border border-white/20 hover:border-white/40 hover:bg-white/5",
	ghost: "hover:bg-white/5",
};

export const Button = ({ as: As = "button", variant = "filled", className, ...props }) => {
	return <As className={cn(base, variants[variant], className)} {...props} />;
};