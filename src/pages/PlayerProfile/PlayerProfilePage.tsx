import { Header, PageShell, Text } from "../../components";

type PlayerProfile = {
	name: string;
	handle: string;
	role: string;
	team: string;
	location: string;
	joined: string;
	bio: string;
	coverImage: string;
	avatarImage: string;
};

type Stat = {
	label: string;
	value: string;
};

type TrendPoint = {
	label: string;
	value: number;
};

type PartnerStat = {
	name: string;
	matches: number;
	wins: number;
	losses: number;
	winPct: number;
};

type StatHighlight = {
	label: string;
	value: string;
	change: string;
	trend: "up" | "down";
};

const playerProfile: PlayerProfile = {
	name: "Seth Cadler",
	handle: "@sethcadler",
	role: "Right-side Specialist",
	team: "Evergreen Echoes",
	location: "Florida, USA",
	joined: "Joined 2022",
	bio: "Relentless energy on the court and exceptional ability to read the game. Enjoys hiking and exploring new coffee shops.",
	coverImage:
		"https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
	avatarImage:
		"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80",
};

const socialStats: Stat[] = [
	{ label: "Games won", value: "18" },
	{ label: "Games lost", value: "5" },
	{ label: "Lines won / match", value: "2.3 avg" },
];

const quickStats: Stat[] = [
	{ label: "Win percentage", value: "78%" },
	{ label: "Win streak", value: "5 matches" },
	{ label: "Total matches", value: "23 played" },
];

const performanceTrend: TrendPoint[] = [
	{ label: "M-8", value: 4 },
	{ label: "M-7", value: 6 },
	{ label: "M-6", value: 3 },
	{ label: "M-5", value: 8 },
	{ label: "M-4", value: -1 },
	{ label: "M-3", value: 5 },
	{ label: "M-2", value: 2 },
	{ label: "M-1", value: 7 },
];

const mostPlayedPartner: PartnerStat = {
	name: "Elias Rivera",
	matches: 12,
	wins: 9,
	losses: 3,
	winPct: 75,
};

const statHighlights: StatHighlight[] = [
	{
		label: "Average point differential",
		value: "+4.3 pts",
		change: "+1.1 vs last 8",
		trend: "up",
	},
	{
		label: "Games won vs lost",
		value: "18 / 5",
		change: "5 on current streak",
		trend: "up",
	},
	{
		label: "Lines won per match",
		value: "2.3 avg",
		change: "+0.2 vs season avg",
		trend: "up",
	},
];

type PlayerAvatarProps = {
	src: string;
	alt: string;
};

const PlayerAvatar = ({ src, alt }: PlayerAvatarProps) => (
	<div className="h-32 w-32 overflow-hidden rounded-full border-4 border-(--surface-panel) bg-(--surface-panel) shadow-(--md-sys-elevation-1)">
		<img
			src={src}
			alt={alt}
			className="h-full w-full object-cover"
			loading="lazy"
		/>
	</div>
);

type StatsGridProps = {
	stats: Stat[];
};

type MostPlayedPartnerProps = {
	partner: PartnerStat;
};

const SocialStatsRow = ({ stats }: StatsGridProps) => (
	<div className="mt-2 flex flex-wrap gap-5 text-sm text-(--text-secondary)">
		{stats.map((stat) => (
			<span key={stat.label} className="flex items-center gap-1">
				<Text as="span" variant="strong" size="sm">
					{stat.value}
				</Text>
				<Text as="span" variant="muted" size="sm">
					{stat.label}
				</Text>
			</span>
		))}
	</div>
);

const MostPlayedPartnerCard = ({ partner }: MostPlayedPartnerProps) => (
	<div className="mt-5 rounded-2xl border border-(--border-subtle) bg-(--surface-panel) px-4 py-4 shadow-(--md-sys-elevation-1) sm:max-w-sm">
		<Text variant="eyebrowMuted" size="xs">
			Most played partner
		</Text>
		<Header level={4} size="lg" className="mt-1">
			{partner.name}
		</Header>
		<Text variant="muted" size="sm" className="mt-1">
			{partner.matches} matches &mdash; {partner.wins}-{partner.losses} (
			{partner.winPct}% win rate)
		</Text>
	</div>
);

const QuickStatsGrid = ({ stats }: StatsGridProps) => (
	<div className="mt-5 grid gap-3 sm:grid-cols-3">
		{stats.map((stat) => (
			<div
				key={stat.label}
				className="rounded-2xl border border-(--border-subtle) bg-(--surface-panel) px-4 py-3"
			>
				<Text variant="subtle" size="sm">
					{stat.label}
				</Text>
				<Text variant="strong" size="lg" className="mt-1">
					{stat.value}
				</Text>
			</div>
		))}
	</div>
);

type ProfileHeroProps = {
	profile: PlayerProfile;
	socialStats: Stat[];
	quickStats: Stat[];
};

const ProfileHero = ({
	profile,
	socialStats,
	quickStats,
}: ProfileHeroProps) => (
	<section className="md-card p-0">
		<div className="relative h-56 w-full overflow-hidden rounded-t-(--md-sys-shape-corner-extra-large) bg-(--surface-hover)">
			<img
				src={profile.coverImage}
				alt="Player cover background"
				className="h-full w-full object-cover"
				loading="lazy"
			/>
			<div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/10 to-black/60" />
		</div>

		<div className="relative z-10 px-6 pb-8 pt-10 sm:px-10">
			<div className="-mt-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
					<PlayerAvatar
						src={profile.avatarImage}
						alt={`${profile.name} profile`}
					/>
					<div className="space-y-2">
						<Header level={2} variant="primary" size="lg">
							{profile.name}
						</Header>
						<Text variant="muted" size="sm">
							{profile.handle}
						</Text>
						<Text variant="subtle" size="sm">
							{profile.role}
							<span
								aria-hidden="true"
								className="mx-2 text-(--text-muted)"
							>
								|
							</span>
							{profile.team}
						</Text>
					</div>
				</div>
				<button
					type="button"
					className="inline-flex items-center justify-center rounded-full border border-(--border-subtle) px-5 py-2 text-sm font-semibold text-(--text-secondary) transition-colors duration-200 hover:border-(--accent) hover:text-(--accent)"
				>
					Follow profile
				</button>
			</div>

			<Text variant="body" size="md" className="mt-6 max-w-3xl">
				{profile.bio}
			</Text>

			<div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-(--text-secondary)">
				<span>{profile.location}</span>
				<span>{profile.joined}</span>
			</div>

			<SocialStatsRow stats={socialStats} />
			<QuickStatsGrid stats={quickStats} />
			<MostPlayedPartnerCard partner={mostPlayedPartner} />
		</div>
	</section>
);

type StatTrendChartProps = {
	data: TrendPoint[];
};

const StatTrendChart = ({ data }: StatTrendChartProps) => {
	if (!data.length) {
		return null;
	}

	const width = 920;
	const height = 260;
	const padding = { top: 14, right: 20, bottom: 42, left: 46 };
	const chartWidth = width - padding.left - padding.right;
	const chartHeight = height - padding.top - padding.bottom;
	const baselineY = height - padding.bottom;

	const values = data.map((point) => point.value);
	const baseMin = Math.min(...values);
	const baseMax = Math.max(...values);
	const paddingValue = Math.max((baseMax - baseMin) * 0.1, 4);
	const minValue = baseMin - paddingValue;
	const maxValue = baseMax + paddingValue;
	const range = Math.max(maxValue - minValue, 1);

	const points = data.map((point, index) => {
		const x =
			padding.left +
			chartWidth * (data.length === 1 ? 0.5 : index / (data.length - 1));
		const y =
			padding.top +
			chartHeight -
			((point.value - minValue) / range) * chartHeight;

		return { ...point, x, y };
	});

	const areaPath = [
		`M ${points[0].x} ${baselineY}`,
		...points.map((point) => `L ${point.x} ${point.y}`),
		`L ${points[points.length - 1].x} ${baselineY}`,
		"Z",
	].join(" ");

	const linePath = points
		.map(
			(point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
		)
		.join(" ");

	const ySteps = 4;
	const ticks = Array.from({ length: ySteps + 1 }, (_, index) => {
		const ratio = index / ySteps;
		const value = maxValue - range * ratio;
		const y = padding.top + chartHeight * ratio;

		return { y, value };
	});

	return (
		<svg
			viewBox={`0 0 ${width} ${height}`}
			role="img"
			aria-label="Point differential trend"
			className="h-full w-full"
		>
			<defs>
				<linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
					<stop
						offset="0%"
						stopColor="var(--accent)"
						stopOpacity="0.28"
					/>
					<stop
						offset="100%"
						stopColor="var(--accent)"
						stopOpacity="0"
					/>
				</linearGradient>
			</defs>

			{ticks.map((tick, index) => (
				<g key={tick.value + index}>
					<line
						x1={padding.left}
						x2={width - padding.right}
						y1={tick.y}
						y2={tick.y}
						stroke="var(--border-subtle)"
						strokeWidth="1"
						strokeDasharray="5 6"
						opacity={0.75}
					/>
					<text
						x={padding.left - 10}
						y={tick.y + 4}
						textAnchor="end"
						style={{
							fill: "var(--text-subtle)",
							fontSize: "11px",
							fontWeight: 600,
						}}
					>
						{Math.round(tick.value)}
					</text>
				</g>
			))}

			<path d={areaPath} fill="url(#trendFill)" />
			<path
				d={linePath}
				fill="none"
				stroke="var(--accent)"
				strokeWidth="3.5"
				strokeLinecap="round"
			/>

			{points.map((point) => (
				<g key={point.label}>
					<circle
						cx={point.x}
						cy={point.y}
						r={4.5}
						fill="var(--surface-panel)"
						stroke="var(--accent)"
						strokeWidth="2"
					/>
					<text
						x={point.x}
						y={baselineY + 18}
						textAnchor="middle"
						style={{
							fill: "var(--text-subtle)",
							fontSize: "11px",
							fontWeight: 600,
						}}
					>
						{point.label}
					</text>
				</g>
			))}
		</svg>
	);
};

const PlayerStatsGraph = () => {
	const startingPoint = performanceTrend[0];
	const latestPoint = performanceTrend[performanceTrend.length - 1];
	const delta = latestPoint.value - startingPoint.value;
	const deltaLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts since ${
		startingPoint.label
	}`;

	return (
		<section className="md-card border border-(--border-subtle) bg-(--surface-panel) p-6 shadow-(--md-sys-elevation-1) md:p-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<Text variant="eyebrowMuted" size="xs">
						Player pulse
					</Text>
					<Header level={3} size="xl">
						Point differential per match
					</Header>
					<Text variant="muted" size="sm">
						Points for minus points against, across her eight most
						recent recorded matches.
					</Text>
				</div>
				<div className="rounded-[18px] border border-(--border-highlight) bg-(--surface-raised) px-4 py-3 text-right shadow-(--md-sys-elevation-1)">
					<Text variant="subtle" size="xs">
						Last result differential
					</Text>
					<Header level={4} size="lg" className="text-(--accent)">
						{latestPoint.value > 0 ? "+" : ""}
						{latestPoint.value} pts
					</Header>
					<Text
						variant="muted"
						size="sm"
						className={`font-semibold ${
							delta >= 0 ? "text-(--success)" : "text-(--danger)"
						}`}
					>
						{deltaLabel}
					</Text>
				</div>
			</div>

			<div className="mt-6 rounded-[22px] border border-(--border-subtle) bg-(--surface-card) p-4">
				<StatTrendChart data={performanceTrend} />
			</div>

			<div className="mt-6 grid gap-3 md:grid-cols-3">
				{statHighlights.map((highlight) => (
					<div
						key={highlight.label}
						className="rounded-2xl border border-(--border-subtle) bg-(--surface-panel) px-4 py-3"
					>
						<Text variant="subtle" size="xs">
							{highlight.label}
						</Text>
						<Text
							variant="strong"
							size="lg"
							className="mt-1 text-[1.25rem]"
						>
							{highlight.value}
						</Text>
						<Text
							variant="muted"
							size="sm"
							className={`mt-2 inline-flex items-center gap-2 font-semibold ${
								highlight.trend === "up"
									? "text-(--success)"
									: "text-(--danger)"
							}`}
						>
							<span
								className="inline-block h-2 w-2 rounded-full bg-current"
								aria-hidden="true"
							/>
							{highlight.change}
						</Text>
					</div>
				))}
			</div>
		</section>
	);
};

function PlayerProfilePage() {
	return (
		<PageShell
			title="Player Profile"
			description="A snapshot showing a player's profile, stats, and performance trends."
			maxWidthClass="max-w-6xl"
		>
			<div className="flex flex-col gap-6">
				<ProfileHero
					profile={playerProfile}
					socialStats={socialStats}
					quickStats={quickStats}
				/>
				<PlayerStatsGraph />
			</div>
		</PageShell>
	);
}

export default PlayerProfilePage;
