import type { SupabaseRelation } from "../types/league";

export const takeFirstRelationValue = <T>(
	relation: SupabaseRelation<T>
): T | null => {
	if (!relation) return null;
	if (Array.isArray(relation)) {
		return relation.length ? relation[0]! : null;
	}
	return relation;
};

export const normalizeRelation = <T>(relation: SupabaseRelation<T>): T | null =>
	takeFirstRelationValue(relation);

export const normalizeRelationArray = <T>(
	relation: SupabaseRelation<T>
): T[] => {
	if (!relation) return [];
	const values = Array.isArray(relation) ? relation : [relation];
	return values.filter(Boolean) as T[];
};

const normalizeTimetzOffset = (time: string): string => {
	if (!time) return time;
	if (time.endsWith("Z")) return time;

	const offsetMatch = time.match(/([+-]\d{2})(\d{2})?$/);
	if (!offsetMatch) return time;

	const [, hours, minutes] = offsetMatch;
	return time.replace(offsetMatch[0], `${hours}:${minutes ?? "00"}`);
};

export const parseSupabaseDateTime = (
	date: string | null,
	time: string | null
): Date | null => {
	if (!date) return null;

	if (time) {
		const normalizedTime = normalizeTimetzOffset(time);
		const isoDateTimeString = `${date}T${normalizedTime}`;
		const parsedIso = new Date(isoDateTimeString);
		if (!Number.isNaN(parsedIso.valueOf())) return parsedIso;

		const fallback = new Date(`${date} ${time}`);
		if (!Number.isNaN(fallback.valueOf())) return fallback;
	}

	const parsedDateOnly = new Date(date);
	return Number.isNaN(parsedDateOnly.valueOf()) ? null : parsedDateOnly;
};
