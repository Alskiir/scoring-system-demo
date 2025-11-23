import { Header, Text } from "../../../components";
import type { StatHighlight, TrendPoint } from "../types";

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

type PlayerStatsGraphProps = {
	trend: TrendPoint[];
	statHighlights: StatHighlight[];
};

function PlayerStatsGraph({ trend, statHighlights }: PlayerStatsGraphProps) {
	if (!trend.length) {
		return null;
	}

	const startingPoint = trend[0];
	const latestPoint = trend[trend.length - 1];
	const delta = latestPoint.value - startingPoint.value;
	const deltaLabel = `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts since ${
		startingPoint.label
	}`;

	return (
		<section className="md-card border border-(--border-subtle) bg-(--surface-panel) p-6 shadow-(--md-sys-elevation-1) md:p-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<Text variant="eyebrowMuted" size="xs">
						Performance overview
					</Text>
					<Header level={3} size="xl">
						Point differential per match
					</Header>
					<Text variant="muted" size="sm">
						Point differential across the most recent matches
						played.
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
				<StatTrendChart data={trend} />
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
}

export default PlayerStatsGraph;
