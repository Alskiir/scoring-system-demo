import { useCallback, useEffect, useSyncExternalStore } from "react";

type ResourceStatus = "idle" | "success" | "error";

type ResourceState<T> = {
	status: ResourceStatus;
	data: T | null;
	error: Error | null;
	isFetching: boolean;
	promise: Promise<T> | null;
	updatedAt: number;
};

const resourceStore = new Map<string, ResourceState<unknown>>();
const listeners = new Map<string, Set<() => void>>();

const createInitialState = <T>(initialData?: T): ResourceState<T> => ({
	status: initialData === undefined ? "idle" : "success",
	data: (initialData ?? null) as T | null,
	error: null,
	isFetching: false,
	promise: null,
	updatedAt: 0,
});

const primeResourceState = <T>(key: string, initialData?: T) => {
	if (resourceStore.has(key)) {
		return;
	}

	resourceStore.set(key, createInitialState(initialData));
};

const getResourceState = <T>(key: string): ResourceState<T> => {
	const existing = resourceStore.get(key) as ResourceState<T> | undefined;

	if (existing) {
		return existing;
	}

	const initial = createInitialState<T>();
	resourceStore.set(key, initial);
	return initial;
};

const setResourceState = <T>(
	key: string,
	updater: Partial<ResourceState<T>>
) => {
	const prev = getResourceState<T>(key);
	const next: ResourceState<T> = {
		...prev,
		...updater,
	};

	resourceStore.set(key, next);
	listeners.get(key)?.forEach((listener) => listener());
	return next;
};

const subscribeToResource = (key: string, listener: () => void) => {
	const current = listeners.get(key) ?? new Set();
	current.add(listener);
	listeners.set(key, current);

	return () => {
		current.delete(listener);
		if (!current.size) {
			listeners.delete(key);
		}
	};
};

const startResourceFetch = async <T>(
	key: string,
	fetcher: () => Promise<T>
) => {
	const current = getResourceState<T>(key);

	if (current.isFetching && current.promise) {
		return current.promise;
	}

	const promise = (async () => {
		try {
			const result = await fetcher();
			setResourceState<T>(key, {
				data: result,
				error: null,
				status: "success",
				isFetching: false,
				promise: null,
				updatedAt: Date.now(),
			});
			return result;
		} catch (rawError) {
			const error =
				rawError instanceof Error
					? rawError
					: new Error(String(rawError));

			setResourceState<T>(key, {
				error,
				status: "error",
				isFetching: false,
				promise: null,
				updatedAt: Date.now(),
			});

			throw error;
		}
	})();

	const nextStatus =
		current.status === "success"
			? "success"
			: current.status === "error"
			? "error"
			: "idle";

	setResourceState<T>(key, {
		promise,
		isFetching: true,
		status: nextStatus,
		error: null,
	});

	return promise;
};

export const invalidateResource = (key: string) => {
	const current = getResourceState(key);
	setResourceState(key, {
		...current,
		updatedAt: 0,
	});
};

type UseAsyncResourceOptions<T> = {
	enabled?: boolean;
	staleTime?: number;
	initialData?: T;
};

export type UseAsyncResourceResult<T> = {
	data: T | null;
	error: Error | null;
	status: ResourceStatus;
	isFetching: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	isError: boolean;
	updatedAt: number;
	refetch: () => Promise<T>;
	invalidate: () => void;
};

export function useAsyncResource<T>(
	key: string,
	fetcher: () => Promise<T>,
	options?: UseAsyncResourceOptions<T>
): UseAsyncResourceResult<T> {
	const {
		enabled = true,
		staleTime = 5 * 60_000,
		initialData,
	} = options ?? {};

	primeResourceState<T>(key, initialData);

	const snapshot = useSyncExternalStore<ResourceState<T>>(
		(listener) => subscribeToResource(key, listener),
		() => getResourceState<T>(key),
		() => getResourceState<T>(key)
	);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		if (snapshot.isFetching) {
			return;
		}

		const isStale =
			staleTime === Infinity
				? false
				: Date.now() - snapshot.updatedAt >= staleTime;

		if (
			snapshot.status === "idle" ||
			(snapshot.status === "success" && isStale)
		) {
			startResourceFetch(key, fetcher);
		}
	}, [
		enabled,
		fetcher,
		key,
		snapshot.isFetching,
		snapshot.status,
		snapshot.updatedAt,
		staleTime,
	]);

	const refetch = useCallback(
		() => startResourceFetch(key, fetcher),
		[fetcher, key]
	);

	const invalidate = useCallback(() => invalidateResource(key), [key]);

	return {
		data: snapshot.data,
		error: snapshot.error,
		status: snapshot.status,
		isFetching: snapshot.isFetching,
		isLoading: snapshot.status === "idle" && snapshot.isFetching,
		isSuccess: snapshot.status === "success",
		isError: snapshot.status === "error",
		updatedAt: snapshot.updatedAt,
		refetch,
		invalidate,
	};
}
