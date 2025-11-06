import { GlassCard, PageShell } from "../../components";

const coreFeatures = [
	{
		title: "Dynamic Scoring Engine",
		description:
			"Updates standings automatically as match results are entered.",
	},
	{
		title: "Team & Player Profiles",
		description:
			"Keeps every roster organized, searchable, and ready for captains.",
	},
	{
		title: "Match Scheduling",
		description:
			"Balances upcoming fixtures with detailed recaps of completed games.",
	},
	{
		title: "Season & Division Management",
		description: "Structures data by skill level, region, and timeframe.",
	},
	{
		title: "Responsive Design",
		description:
			"Delivers a consistent experience from desktops to courtside devices.",
	},
];

const technologyStack = [
	{
		name: "React + TypeScript + Vite",
		description: "Powering fast, type-safe UI development.",
	},
	{
		name: "Tailwind CSS",
		description:
			"Modern, adaptive styling with a consistent design language.",
	},
	{
		name: "Node.js / Express",
		description: "Planned backend services for APIs and real-time updates.",
	},
	{
		name: "PostgreSQL",
		description: "Relational schema designed for nationwide scalability.",
	},
];

const futureVision = [
	"Player registration and ranking history",
	"Real-time score submission and live match updates",
	"Captain toolkits and integrated team communication",
	"League-wide analytics dashboards and automated reports",
	"Optional mobile app integration for sideline operations",
];

function AboutPage() {
	return (
		<PageShell
			title="About the WPPL Scoring System"
			description="The WPPL scoring demo showcases a modern league platform designed specifically for the Women's Power Pickleball League."
			maxWidthClass="max-w-5xl"
			paddingClass="px-6 md:px-10"
		>
			<GlassCard description="This application brings scheduling, score tracking, and standings together in a single web-based experience. With performance, clarity, and scalability in mind, the WPPL Scoring System helps organizers, captains, and fans stay aligned throughout every season." />

			<div className="grid gap-6 md:grid-cols-2">
				<GlassCard
					title="Purpose"
					description="This demo lays the groundwork for a future system that can support the Women's Power Pickleball League (WPPL) across multiple divisions, regions, and seasons. The goal is to provide reliable tools for league organizers while giving players and fans a clear view of ongoing standings and results."
				/>

				<GlassCard
					title="Core Features"
					listItems={coreFeatures.map((feature) => ({
						title: feature.title,
						description: feature.description,
					}))}
				/>
			</div>

			<GlassCard
				title="Technology Stack"
				description="This demo uses a modern, scalable frontend and lays the foundation for a production-ready full-stack solution:"
				listItems={technologyStack.map((tech) => ({
					title: tech.name,
					description: tech.description,
				}))}
				listColumns={2}
			/>

			<GlassCard
				title="Future Vision"
				description="As the WPPL grows, the platform is ready to evolve into a comprehensive digital ecosystem:"
				listItems={futureVision.map((item) => ({
					description: item,
				}))}
				listColumns={2}
				footer="The architecture and data model are engineered for expansion, supporting inter-league play and nationwide participation."
			/>

			<GlassCard
				title="About the Developer"
				description="This experience was designed and developed by Douglass Hart, a software developer with a background in graphics technology and computer information systems. The focus is to combine technical precision with an intuitive user experience so the WPPL can grow with a digital platform tailored to its needs."
			/>
		</PageShell>
	);
}

export default AboutPage;
