import React from "react";

type GlassCardDetail = {
	label: string;
	value: string;
};

type GlassCardListItem = {
	title?: string;
	description: string;
};

interface GlassCardProps {
	title?: string;
	description?: string;
	details?: GlassCardDetail[];
	listItems?: GlassCardListItem[];
	listVariant?: "definition" | "bullet";
	listColumns?: 1 | 2;
	footer?: string;
	className?: string;
	children?: React.ReactNode;
}

const GlassCard: React.FC<GlassCardProps> = ({
	title,
	description,
	details,
	listItems,
	listVariant = "definition",
	listColumns = 1,
	footer,
	className = "",
	children,
}) => {
	const hasList = Boolean(listItems?.length);
	const hasDetails = Boolean(details?.length);

	return (
		<div
			className={`rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-8 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur text-neutral-300 ${className}`}
		>
			{title ? (
				<h2 className="text-xl font-semibold text-neutral-100">
					{title}
				</h2>
			) : null}

			{description ? (
				<p
					className={`text-sm leading-relaxed text-neutral-300 ${
						title ? "mt-3" : ""
					}`}
				>
					{description}
				</p>
			) : null}

			{hasDetails ? (
				<dl className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
					{details!.map((detail) => (
						<div
							key={detail.label}
							className="rounded-xl border border-neutral-800/60 bg-neutral-900/60 px-4 py-3"
						>
							<dt className="text-xs uppercase tracking-wide text-neutral-500">
								{detail.label}
							</dt>
							<dd className="mt-1 text-sm font-semibold text-neutral-100">
								{detail.value}
							</dd>
						</div>
					))}
				</dl>
			) : null}

			{hasList ? (
				<ul
					className={`mt-4 grid gap-2 text-sm text-neutral-300 ${
						listColumns === 2 ? "md:grid-cols-2" : ""
					}`}
				>
					{listItems!.map((item, index) => (
						<li
							key={item.title ?? item.description ?? index}
							className="rounded-xl border border-neutral-800/60 bg-neutral-900/60 px-4 py-3"
						>
							{listVariant === "definition" && item.title ? (
								<>
									<span className="font-semibold text-neutral-100">
										{item.title}
									</span>
									<span className="text-neutral-300">
										{" "}
										- {item.description}
									</span>
								</>
							) : (
								<span className="text-neutral-300">
									{item.description}
								</span>
							)}
						</li>
					))}
				</ul>
			) : null}

			{footer ? (
				<p className="mt-4 text-sm text-neutral-300">{footer}</p>
			) : null}

			{children}
		</div>
	);
};

export default GlassCard;
