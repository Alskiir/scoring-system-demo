import { Outlet } from "react-router-dom";
import { Navbar } from "./components";

function App() {
	return (
		<div className="flex flex-col min-h-screen bg-gray-50">
			<Navbar />
			<div className="flex-grow">
				<Outlet />
			</div>
		</div>
	);
}

export default App;
