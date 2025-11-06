import { Table } from "../../components";

function Home() {
	return (
		<div className="min-h-screen flex flex-col">
			<main className="flex-1 flex flex-col items-center justify-center gap-6">
				<h1 className="text-3xl font-semibold tracking-tight">Home</h1>
				<Table
					headers={["Name", "Score", "Team"]}
					data={[
						["Alice", 12, "Blue Rockets"],
						["Bob", 15, "Red Panthers"],
					]}
				/>
			</main>
		</div>
	);
}

export default Home;
