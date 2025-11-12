export type SupabaseRelation<T> = T | T[] | null | undefined;

export type TeamRecord = {
	id: string;
	name: string;
	location?: string | null;
};

export type PersonRecord = {
	id: string;
	first_name: string;
	last_name: string;
	email: string | null;
	phone_mobile: string | null;
	birthday?: string | null;
};

export type TeamMembership = {
	role: string | null;
	person: SupabaseRelation<PersonRecord>;
};

export type TeamRosterEntry = {
	role: string | null;
	person: PersonRecord;
};

export type PlayerOption = {
	id: string;
	fullName: string;
};

export type TeamSelectOption = {
	value: string;
	label: string;
	disabled?: boolean;
};
