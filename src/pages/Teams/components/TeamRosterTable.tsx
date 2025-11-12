import { useMemo } from "react";
import { Table } from "../../../components";
import { formatFullName } from "../../../utils/dataTransforms";
import type { TeamRosterEntry } from "../types";

const tableHeaders = ["Player", "Role", "Email", "Phone"];

type TeamRosterTableProps = {
	roster: TeamRosterEntry[];
};

function TeamRosterTable({ roster }: TeamRosterTableProps) {
	const tableData = useMemo(
		() =>
			roster.map((entry) => {
				const fullName = formatFullName(
					entry.person.first_name,
					entry.person.last_name
				);

				return [
					fullName,
					entry.role ?? "-",
					entry.person.email ?? "-",
					entry.person.phone_mobile ?? "-",
				];
			}),
		[roster]
	);

	return <Table headers={tableHeaders} data={tableData} />;
}

export default TeamRosterTable;
