import React from "react";

interface GlassCardProps {
	children: React.ReactNode;
	className?: string;
	paddingClass?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({
	children,
	className = "",
	paddingClass = "p-6",
}) => {
	return (
		<div
			className={`rounded-2xl border border-neutral-800/60 bg-neutral-900/70 ${paddingClass} shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur ${className}`}
		>
			{children}
		</div>
	);
};

export default GlassCard;

