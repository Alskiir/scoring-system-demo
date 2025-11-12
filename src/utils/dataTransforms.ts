import type { SupabaseRelation } from "../types/league";

export const takeFirstRelationValue = <T>(
	relation: SupabaseRelation<T>
): T | null => {
	if (!relation) {
		return null;
	}

	if (Array.isArray(relation)) {
		return relation.length ? relation[0]! : null;
	}

	return relation;
};

export const coerceString = (value: unknown): string | null => {
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length ? trimmed : null;
};

export const coerceNumber = (value: unknown): number | null => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
};

export const coerceIdentifier = (value: unknown): string | number | null => {
	const stringCandidate = coerceString(value);
	if (stringCandidate !== null) {
		return stringCandidate;
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	return null;
};

export const coerceIdentifierFromRecord = (
	record: Record<string, unknown>,
	...keys: string[]
): string | number | null => {
	for (const key of keys) {
		if (!Object.prototype.hasOwnProperty.call(record, key)) {
			continue;
		}

		const normalized = coerceIdentifier(record[key]);
		if (normalized !== null) {
			return normalized;
		}
	}

	return null;
};

export const formatFullName = (
	firstName?: string | null,
	lastName?: string | null
) => {
	const first = coerceString(firstName) ?? "";
	const last = coerceString(lastName) ?? "";
	const combined = `${first} ${last}`.trim();

	return combined.length ? combined : "Unknown Player";
};

export const formatTableColumnLabel = (column: string) =>
	column.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());

const stringifyObject = (value: unknown) => {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
};

export const formatTableCellValue = (value: unknown): string => {
	if (value === null || typeof value === "undefined") {
		return "-";
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (typeof value === "number" && Number.isFinite(value)) {
		return String(value);
	}

	if (typeof value === "boolean") {
		return value ? "true" : "false";
	}

	if (typeof value === "object") {
		const serialized = stringifyObject(value);
		return serialized.length ? serialized : "-";
	}

	const stringValue = coerceString(value) ?? String(value);
	return stringValue.length ? stringValue : "-";
};
