export interface Player {
	id: number;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	rating: number;
	homeClub: string;
}

export interface Season {
	id: number;
	name: string;
	startDate: string;
	endDate: string;
	location: string;
	notes?: string;
}

export interface Division {
	id: number;
	name: string;
	skillLevel: string;
	seasonId: number;
	description: string;
}

export interface Team {
	id: number;
	name: string;
	divisionId: number;
	seasonId: number;
	playerIds: number[];
	captainId: number;
	homeCourt: string;
	primaryColor: string;
}

export type MatchStatus = "Completed" | "Scheduled";

export interface MatchGame {
	gameNumber: number;
	teamAScore: number;
	teamBScore: number;
}

export interface Match {
	id: number;
	divisionId: number;
	seasonId: number;
	teamAId: number;
	teamBId: number;
	matchDate: string;
	status: MatchStatus;
	venue: string;
	games: MatchGame[];
	winnerTeamId?: number;
	highlightPlayerId?: number;
	recap?: string;
}

export const seasons: Season[] = [
	{
		id: 1,
		name: "Fall 2025",
		startDate: "2025-09-02",
		endDate: "2025-12-15",
		location: "Seattle Metropolitan Area, WA",
		notes: "Kickoff season for the Puget Sound Pickleball League.",
	},
];

export const divisions: Division[] = [
	{
		id: 1,
		seasonId: 1,
		name: "3.5 Doubles",
		skillLevel: "3.5",
		description: "Rosters with DUPR averages between 3.25 and 3.75.",
	},
	{
		id: 2,
		seasonId: 1,
		name: "3.0 Doubles",
		skillLevel: "3.0",
		description:
			"Rosters with DUPR averages focused on consistent dinking and placement.",
	},
];

export const players: Player[] = [
	{
		id: 1,
		firstName: "Ava",
		lastName: "Morales",
		email: "ava.morales@rainierpickle.com",
		phone: "+1-206-555-0142",
		rating: 3.6,
		homeClub: "Rainier Paddle Club (Seattle, WA)",
	},
	{
		id: 2,
		firstName: "Jordan",
		lastName: "Patel",
		email: "jordan.patel@rainierpickle.com",
		phone: "+1-206-555-0108",
		rating: 3.7,
		homeClub: "Rainier Paddle Club (Seattle, WA)",
	},
	{
		id: 3,
		firstName: "Leah",
		lastName: "Chen",
		email: "leah.chen@baycitypickle.com",
		phone: "+1-415-555-0199",
		rating: 3.4,
		homeClub: "Mission Bay Pickleball (San Francisco, CA)",
	},
	{
		id: 4,
		firstName: "Mateo",
		lastName: "Alvarez",
		email: "mateo.alvarez@baycitypickle.com",
		phone: "+1-415-555-0134",
		rating: 3.8,
		homeClub: "Mission Bay Pickleball (San Francisco, CA)",
	},
	{
		id: 5,
		firstName: "Brooke",
		lastName: "Simmons",
		email: "brooke.simmons@cascadiapickle.com",
		phone: "+1-360-555-0150",
		rating: 3.1,
		homeClub: "Cascadia Court Collective (Tacoma, WA)",
	},
	{
		id: 6,
		firstName: "Dylan",
		lastName: "Hart",
		email: "dylan.hart@rainierpickle.com",
		phone: "+1-253-555-0183",
		rating: 3.5,
		homeClub: "Rainier Paddle Club (Seattle, WA)",
	},
	{
		id: 7,
		firstName: "Priya",
		lastName: "Nair",
		email: "priya.nair@cascadiapickle.com",
		phone: "+1-206-555-0161",
		rating: 3.6,
		homeClub: "Capitol Hill Courts (Seattle, WA)",
	},
	{
		id: 8,
		firstName: "Sean",
		lastName: "Gallagher",
		email: "sean.gallagher@baycitypickle.com",
		phone: "+1-415-555-0113",
		rating: 3.3,
		homeClub: "Mission Bay Pickleball (San Francisco, CA)",
	},
	{
		id: 9,
		firstName: "Naomi",
		lastName: "Fitzgerald",
		email: "naomi.fitzgerald@harborridgepickle.com",
		phone: "+1-360-555-0192",
		rating: 3.7,
		homeClub: "Harbor Ridge Athletic Club (Bremerton, WA)",
	},
	{
		id: 10,
		firstName: "Lucas",
		lastName: "Grayson",
		email: "lucas.grayson@rainierpickle.com",
		phone: "+1-206-555-0188",
		rating: 3.2,
		homeClub: "Rainier Paddle Club (Seattle, WA)",
	},
	{
		id: 11,
		firstName: "Cora",
		lastName: "Mitchell",
		email: "cora.mitchell@cascadiapickle.com",
		phone: "+1-253-555-0197",
		rating: 3.0,
		homeClub: "Cascadia Court Collective (Tacoma, WA)",
	},
	{
		id: 12,
		firstName: "Ethan",
		lastName: "Brooks",
		email: "ethan.brooks@rainierpickle.com",
		phone: "+1-206-555-0159",
		rating: 3.6,
		homeClub: "Green Lake Pickle Center (Seattle, WA)",
	},
];

export const teams: Team[] = [
	{
		id: 1,
		name: "Rainier Smash",
		divisionId: 1,
		seasonId: 1,
		playerIds: [1, 2, 6, 7],
		captainId: 2,
		homeCourt: "Green Lake Pickle Center (Seattle, WA)",
		primaryColor: "#0ea5e9",
	},
	{
		id: 2,
		name: "Bay City Dinks",
		divisionId: 1,
		seasonId: 1,
		playerIds: [3, 4, 8, 9],
		captainId: 3,
		homeCourt: "Mission Bay Courts (San Francisco, CA)",
		primaryColor: "#f97316",
	},
	{
		id: 3,
		name: "Cascadia Dink Queens",
		divisionId: 2,
		seasonId: 1,
		playerIds: [5, 7, 11],
		captainId: 7,
		homeCourt: "Capitol Hill Courts (Seattle, WA)",
		primaryColor: "#a855f7",
	},
	{
		id: 4,
		name: "Harbor Ridge Waves",
		divisionId: 2,
		seasonId: 1,
		playerIds: [1, 3, 9],
		captainId: 9,
		homeCourt: "Harbor Ridge Athletic Club (Bremerton, WA)",
		primaryColor: "#f43f5e",
	},
];

export const matches: Match[] = [
	{
		id: 1,
		divisionId: 1,
		seasonId: 1,
		teamAId: 1,
		teamBId: 2,
		matchDate: "2025-10-12",
		status: "Completed",
		venue: "Green Lake Pickle Center (Seattle, WA)",
		games: [
			{ gameNumber: 1, teamAScore: 11, teamBScore: 8 },
			{ gameNumber: 2, teamAScore: 6, teamBScore: 11 },
			{ gameNumber: 3, teamAScore: 11, teamBScore: 9 },
		],
		winnerTeamId: 1,
		highlightPlayerId: 1,
		recap: "Rainier Smash closed strong thanks to Ava Morales' soft hands at the kitchen.",
	},
	{
		id: 2,
		divisionId: 2,
		seasonId: 1,
		teamAId: 3,
		teamBId: 4,
		matchDate: "2025-10-05",
		status: "Completed",
		venue: "Kitsap Pavilion Courts (Silverdale, WA)",
		games: [
			{ gameNumber: 1, teamAScore: 11, teamBScore: 7 },
			{ gameNumber: 2, teamAScore: 12, teamBScore: 10 },
		],
		winnerTeamId: 3,
		highlightPlayerId: 7,
		recap: "Cascadia Dink Queens swept behind Priya Nair's aggressive third-shot drops.",
	},
	{
		id: 3,
		divisionId: 1,
		seasonId: 1,
		teamAId: 2,
		teamBId: 1,
		matchDate: "2025-11-09",
		status: "Scheduled",
		venue: "Mission Bay Courts (San Francisco, CA)",
		games: [],
	},
	{
		id: 4,
		divisionId: 2,
		seasonId: 1,
		teamAId: 4,
		teamBId: 3,
		matchDate: "2025-11-16",
		status: "Scheduled",
		venue: "Harbor Ridge Athletic Club (Bremerton, WA)",
		games: [],
	},
];

export const mockLeague = {
	seasons,
	divisions,
	teams,
	players,
	matches,
};
