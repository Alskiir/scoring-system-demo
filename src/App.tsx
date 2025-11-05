import { Navbar } from "./components";

function App() {
	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<main className="flex-1 flex items-center justify-center">
				<h1 className="text-2xl font-semibold">
					Welcome to the WPPL Demo!
				</h1>
			</main>
		</div>
	);
}

export default App;
