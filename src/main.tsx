import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import { HomePage, ScoresPage, StandingsPage, TeamsPage } from "./pages";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<App />}>
					<Route index element={<HomePage />} />
					<Route path="home" element={<HomePage />} />
					<Route path="scores" element={<ScoresPage />} />
					<Route path="standings" element={<StandingsPage />} />
					<Route path="teams" element={<TeamsPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
