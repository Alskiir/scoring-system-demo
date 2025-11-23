import { useMemo, useState } from "react";
import {
	BaseCard,
	PageShell,
	Table,
	Text,
	type TableColumn,
} from "../../components";
import { DEFAULT_TABLE_PAGE_SIZE } from "../../constants/pagination";
import {
	formatTableCellValue,
	formatTableColumnLabel,
} from "../../utils/dataTransforms";
import {
	databaseTables,
	fetchTableRows,
	type DatabaseTableName,
	type TableDescriptor,
} from "../../data-access/tables";
import { useAsyncResource } from "../../hooks/useAsyncResource";

const descriptorMap = new Map<DatabaseTableName, TableDescriptor>(
	databaseTables.map((descriptor) => [descriptor.name, descriptor])
);
type GenericRow = Record<string, unknown>;
const collator = new Intl.Collator(undefined, {
	numeric: true,
	sensitivity: "base",
});
const ROW_ID_CANDIDATES = [
	"id",
	"ID",
	"Id",
	"_id",
	"uuid",
	"UUID",
	"key",
] as const;

const getRowIdFromRecord = (row: GenericRow, index: number) => {
	for (const key of ROW_ID_CANDIDATES) {
		const value = row[key];
		if (typeof value === "string" || typeof value === "number") {
			return value;
		}
	}

	return `${index}`;
};

const parseNumericValue = (value: unknown) => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		if (!trimmed.length) return null;
		const parsed = Number(trimmed);
		if (Number.isFinite(parsed)) {
			return parsed;
		}
	}

	return null;
};

const normalizeStringValue = (value: unknown): string => {
	if (typeof value === "string") {
		return value.trim();
	}

	if (value === null || typeof value === "undefined") {
		return "";
	}

	if (value instanceof Date) {
		return value.toISOString();
	}

	if (typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			return "";
		}
	}

	return String(value);
};

const compareRecordValues = (a: unknown, b: unknown) => {
	const aNumber = parseNumericValue(a);
	const bNumber = parseNumericValue(b);

	if (aNumber !== null && bNumber !== null) {
		return aNumber - bNumber;
	}

	const aString = normalizeStringValue(a);
	const bString = normalizeStringValue(b);
	return collator.compare(aString, bString);
};

const buildColumnOrder = (
	rows: Record<string, unknown>[],
	descriptor?: TableDescriptor
) => {
	const seen = new Set<string>();
	const ordered: string[] = [];

	if (descriptor?.columns) {
		for (const column of descriptor.columns) {
			if (!seen.has(column)) {
				seen.add(column);
				ordered.push(column);
			}
		}
	}

	for (const row of rows) {
		if (!row || typeof row !== "object") continue;

		for (const key of Object.keys(row)) {
			if (!seen.has(key)) {
				seen.add(key);
				ordered.push(key);
			}
		}
	}

	return ordered;
};

function AllTablesPage() {
	const availableTables = databaseTables;
	const hasTables = availableTables.length > 0;
	const [selectedTable, setSelectedTable] =
		useState<DatabaseTableName | null>(() =>
			hasTables ? availableTables[0]!.name : null
		);
	const resourceKey = selectedTable
		? `allTables:${selectedTable}`
		: "allTables:none";
	const tableQuery = useAsyncResource<Record<string, unknown>[]>(
		resourceKey,
		async () => {
			if (!selectedTable) {
				return [];
			}
			const rows = await fetchTableRows(selectedTable);
			return Array.isArray(rows) ? rows : [];
		},
		{
			enabled: Boolean(selectedTable),
			initialData: [],
			staleTime: 2 * 60_000,
		}
	);

	const activeDescriptor = selectedTable
		? descriptorMap.get(selectedTable)
		: undefined;
	const visibleRows = useMemo(() => {
		if (!selectedTable) return [];
		return tableQuery.data ?? [];
	}, [selectedTable, tableQuery.data]);
	const hasCachedRows = visibleRows.length > 0;

	const columnOrder = useMemo(
		() => buildColumnOrder(visibleRows, activeDescriptor),
		[visibleRows, activeDescriptor]
	);
	const columns = useMemo<TableColumn<GenericRow>[]>(() => {
		return columnOrder.map((column, index) => ({
			id: column,
			header: formatTableColumnLabel(column),
			align: index === 0 ? "left" : "center",
			accessor: (row) => formatTableCellValue(row[column]),
			sortFn: (a, b) => compareRecordValues(a[column], b[column]),
		}));
	}, [columnOrder]);
	const defaultSortColumnId = columns.length > 0 ? columns[0]!.id : undefined;

	const handleRefresh = () => {
		if (!selectedTable) {
			return;
		}
		void tableQuery.refetch();
	};

	const isFetching = tableQuery.isLoading || tableQuery.isFetching;
	const errorMessage = tableQuery.error?.message ?? null;

	const isLoadingWithoutCache = tableQuery.isLoading && !hasCachedRows;
	const showTableSkeleton = tableQuery.isFetching && hasCachedRows;
	const showBlockingError = Boolean(errorMessage) && !hasCachedRows;
	const showInlineError = Boolean(errorMessage) && hasCachedRows;
	const tableEmptyMessage = (
		<Text variant="caption" size="sm">
			No rows returned for{" "}
			{activeDescriptor?.label ?? selectedTable ?? "the selected table"}.
		</Text>
	);

	const actions = hasTables ? (
		<div className="flex flex-col gap-2 text-right md:text-left">
			<Text
				as="label"
				htmlFor="table-select"
				variant="eyebrow"
				size="xs"
				className="md-field-label"
			>
				Select table
			</Text>
			<div className="flex flex-wrap gap-3">
				<select
					id="table-select"
					value={selectedTable ?? ""}
					onChange={(event) =>
						setSelectedTable(
							event.target.value as DatabaseTableName
						)
					}
					className="md-input md-select w-full md:w-52"
				>
					{availableTables.map((table) => (
						<option key={table.name} value={table.name}>
							{table.label}
						</option>
					))}
				</select>
				<button
					type="button"
					onClick={handleRefresh}
					disabled={!selectedTable || isFetching}
					className="md-outlined-button"
				>
					{isFetching ? "Refreshing..." : "Refresh"}
				</button>
			</div>
		</div>
	) : null;

	let content: React.ReactNode;

	if (!hasTables) {
		content = (
			<BaseCard description="No tables are configured for display. Add descriptors in src/data-access/tables.ts." />
		);
	} else if (!selectedTable) {
		content = (
			<BaseCard description="Choose a table from the dropdown to inspect its rows." />
		);
	} else if (showBlockingError) {
		content = (
			<BaseCard
				title="Unable to load data"
				description={errorMessage ?? undefined}
				footer="Confirm credentials are configured in the .env file."
			/>
		);
	} else if (isLoadingWithoutCache) {
		content = (
			<BaseCard
				description={`Loading ${
					activeDescriptor?.label ?? "table"
				} data...`}
			/>
		);
	} else {
		content = (
			<div className="flex flex-col gap-6">
				{showInlineError ? (
					<BaseCard
						title="Unable to refresh data"
						description={errorMessage ?? undefined}
						footer="Showing the most recently cached rows for this table."
					/>
				) : null}
				<BaseCard
					title={activeDescriptor?.label ?? "Table details"}
					description={
						activeDescriptor?.description ??
						"Raw rows returned directly from the PostgreSQL database."
					}
					details={[
						{
							label: "Table name",
							value: activeDescriptor?.name ?? "-",
						},
						{
							label: "Rows loaded",
							value: String(visibleRows.length),
						},
						{ label: "Columns", value: String(columnOrder.length) },
					]}
					footer="Results show the latest data returned by the PostgreSQL database. Large tables may be truncated depending on server limits."
				/>
				<Table
					key={selectedTable ?? "all-tables"}
					columns={columns}
					data={visibleRows}
					pageSize={DEFAULT_TABLE_PAGE_SIZE}
					isLoading={showTableSkeleton}
					emptyMessage={tableEmptyMessage}
					initialSortColumnId={defaultSortColumnId}
					initialSortDirection="asc"
					getRowId={getRowIdFromRecord}
				/>
			</div>
		);
	}

	return (
		<PageShell
			title="All Tables"
			description="Inspect every table backing the demo. Use the dropdown to switch between raw datasets."
			actions={actions}
		>
			{content}
		</PageShell>
	);
}

export default AllTablesPage;
