import React from "react";

const Navbar: React.FC = () => {
	return (
		<nav className="bg-[#263C96] text-white shadow-lg flex justify-center">
			<div className="max-w-7xl px-8 w-full">
				<div className="flex justify-between items-center h-20">
					{/* Left: Logo and/or Title */}
					<div className="flex items-center">
						<span className="font-semibold text-xl tracking-wide">
							WPPL Scoring System Demo
						</span>
					</div>

					{/* Right: Nav Links */}
					<div className="hidden md:flex items-center gap-6">
						{["Home", "Scores", "Standings", "Teams"].map(
							(link) => (
								<a
									key={link}
									href="#"
									className="relative px-4 py-2 text-base font-medium transition-all duration-200 hover:text-[#FFD500]
                                           after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#FFD500]
                                           hover:after:w-full after:transition-all after:duration-300"
								>
									{link}
								</a>
							)
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
