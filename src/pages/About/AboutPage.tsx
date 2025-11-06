function AboutPage() {
	return (
		<div className="flex min-h-screen flex-col bg-neutral-950/95 text-neutral-100">
			<main className="flex-1 py-16">
				<div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 md:px-10">
					<section className="flex flex-col gap-4">
						<h1 className="text-3xl font-semibold tracking-tight">
							About the WPPL Scoring System
						</h1>
						<p className="text-base text-neutral-300">
							The WPPL Scoring System demo showcases a modern,
							web-first platform built to simplify how
							women&apos;s pickleball leagues manage their
							seasons. With performance, clarity, and scalability
							at its core, this application unifies scheduling,
							score tracking, and standings into an intuitive
							experience for organizers, captains, and fans.
						</p>
					</section>

					<section className="grid gap-6 rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-8 shadow-[0_12px_30px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-2">
						<div className="flex flex-col gap-3">
							<h2 className="text-xl font-semibold text-neutral-100">
								Purpose
							</h2>
							<p className="text-sm leading-relaxed text-neutral-300">
								This demo lays the groundwork for a future
								system that can support the Women&apos;s Power
								Pickleball League (WPPL) across multiple
								divisions, regions, and seasons. The goal is to
								empower league organizers and captains with
								reliable management tools while offering players
								and fans a clear view of live standings and
								match history.
							</p>
						</div>
						<div className="flex flex-col gap-3">
							<h2 className="text-xl font-semibold text-neutral-100">
								Core Features
							</h2>
							<ul className="grid gap-2 text-sm text-neutral-300">
								<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
									<span className="font-semibold text-neutral-100">
										Dynamic Scoring Engine
									</span>{" "}
									– Updates standings automatically as match
									results are entered.
								</li>
								<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
									<span className="font-semibold text-neutral-100">
										Team &amp; Player Profiles
									</span>{" "}
									– Keeps every roster organized and
									searchable.
								</li>
								<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
									<span className="font-semibold text-neutral-100">
										Match Scheduling
									</span>{" "}
									– Balances upcoming fixtures with detailed
									recaps of completed games.
								</li>
								<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
									<span className="font-semibold text-neutral-100">
										Season &amp; Division Management
									</span>{" "}
									– Structures data by skill level, region,
									and timeframe.
								</li>
								<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
									<span className="font-semibold text-neutral-100">
										Responsive Design
									</span>{" "}
									– Delivers a smooth experience from desktop
									dashboards to mobile courtside devices.
								</li>
							</ul>
						</div>
					</section>

					<section className="flex flex-col gap-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-8 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur">
						<h2 className="text-xl font-semibold text-neutral-100">
							Technology Stack
						</h2>
						<p className="text-sm text-neutral-300">
							This demo is powered by a modern, scalable frontend
							and lays the foundation for a production-ready
							full-stack solution:
						</p>
						<ul className="grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								<strong className="text-neutral-100">
									React + TypeScript + Vite
								</strong>{" "}
								for fast, responsive UI development.
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								<strong className="text-neutral-100">
									Tailwind CSS
								</strong>{" "}
								for adaptive, modern styling.
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								<strong className="text-neutral-100">
									Node.js / Express
								</strong>{" "}
								backend services (planned).
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								<strong className="text-neutral-100">
									PostgreSQL
								</strong>{" "}
								schema designed for nationwide scaling.
							</li>
						</ul>
					</section>

					<section className="flex flex-col gap-4 rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-8 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur">
						<h2 className="text-xl font-semibold text-neutral-100">
							Future Vision
						</h2>
						<p className="text-sm text-neutral-300">
							As the WPPL grows, the platform is poised to deliver
							a comprehensive digital ecosystem:
						</p>
						<ul className="grid gap-2 text-sm text-neutral-300 md:grid-cols-2">
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								Player registration and ranking history
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								Real-time score submission and live match
								updates
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								Captain toolkits and team communication hubs
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								League-wide analytics dashboards and automated
								reports
							</li>
							<li className="rounded-xl border border-neutral-800/60 bg-neutral-900/70 px-4 py-3">
								Optional mobile app integration for courtside
								operations
							</li>
						</ul>
						<p className="text-sm text-neutral-300">
							The architecture and data model are engineered for
							expansion, ready to support inter-league play and
							nationwide participation.
						</p>
					</section>

					<section className="flex flex-col gap-3 rounded-2xl border border-neutral-800/60 bg-neutral-900/70 p-8 shadow-[0_12px_30px_rgba(15,23,42,0.35)] backdrop-blur">
						<h2 className="text-xl font-semibold text-neutral-100">
							About the Developer
						</h2>
						<p className="text-sm text-neutral-300">
							This experience was designed and developed by
							Douglass Hart, a software developer with a
							background in graphics technology and computer
							information systems. The WPPL Scoring System
							combines technical precision with an intuitive
							interface, giving the league the digital foundation
							it needs to grow and thrive.
						</p>
					</section>
				</div>
			</main>
		</div>
	);
}

export default AboutPage;
