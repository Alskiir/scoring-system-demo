import { BaseCard, Header, Text } from "../../../components";
import type { TeamHistoryItem } from "../types";

type TeamHistoryCardProps = {
	history: TeamHistoryItem[];
};

const TeamHistoryCard = ({ history }: TeamHistoryCardProps) => {
	const hasHistory = history.length > 0;

	return (
		<BaseCard>
			<div className="flex flex-wrap items-baseline justify-between gap-3">
				<div className="space-y-1">
					<Text variant="eyebrowMuted" size="xs">
						Team journey
					</Text>
					<Header level={3} size="md">
						Past teams
					</Header>
				</div>
			</div>

			{hasHistory ? (
				<ol className="relative mt-6 flex flex-col gap-4">
					{history.map((item, index) => (
						<li key={item.id} className="flex gap-4">
							<div className="relative flex w-6 justify-center">
								<span
									className={`mt-1 h-3 w-3 rounded-full border-2 border-(--surface-panel) ${
										item.isCurrent
											? "bg-(--accent)"
											: "bg-(--surface-hover)"
									}`}
									aria-hidden
								/>
								{index !== history.length - 1 ? (
									<span className="absolute left-1/2 top-4 h-[calc(100%-0.75rem)] w-px -translate-x-1/2 bg-(--border-subtle)" />
								) : null}
							</div>
							<div className="flex-1 rounded-[20px] border border-(--border-subtle) bg-(--surface-panel) px-4 py-4 shadow-(--md-sys-elevation-1)">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="space-y-1">
										<Header level={4} size="sm">
											{item.teamName}
										</Header>
										<Text variant="subtle" size="sm">
											{item.location}
										</Text>
									</div>
									<span className="inline-flex items-center gap-2 rounded-full bg-(--surface-hover) px-3 py-1 text-xs font-semibold text-(--text-secondary)">
										<span
											className={`h-2 w-2 rounded-full ${
												item.isCurrent
													? "bg-(--accent)"
													: "bg-(--text-muted)"
											}`}
											aria-hidden
										/>
										{item.rangeLabel}
									</span>
								</div>
							</div>
						</li>
					))}
				</ol>
			) : (
				<Text variant="muted" size="sm" className="mt-4">
					No team memberships recorded for this player yet.
				</Text>
			)}
		</BaseCard>
	);
};

export default TeamHistoryCard;
