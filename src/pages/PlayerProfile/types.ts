import type { PartnerStats } from "../../data-access/players";

export type PlayerProfile = {
	name: string;
	handle: string;
	role: string;
	team: string;
	location: string;
	joined: string;
	bio: string | null;
	coverImage: string;
	avatarImage: string;
};

export type Stat = {
	label: string;
	value: string;
};

export type TrendPoint = {
	label: string;
	value: number;
};

export type StatHighlight = {
	label: string;
	value: string;
	change: string;
	trend: "up" | "down";
};

export type TeamHistoryItem = {
	id: string;
	teamName: string;
	location: string;
	rangeLabel: string;
	durationLabel: string;
	isCurrent: boolean;
};

export type PlayerProfileViewModel = {
	profile: PlayerProfile | null;
	quickStats: Stat[];
	socialStats: Stat[];
	trend: TrendPoint[];
	statHighlights: StatHighlight[];
	partner: PartnerStats | null;
	teamHistory: TeamHistoryItem[];
	hasStats: boolean;
	hasMatches: boolean;
	loading: boolean;
	error: string | null;
};
