"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { DataTable } from "../components/data-table";
import { columns } from "../components/columns";
import { EmtpyState } from "@/components/empty-state";
import { useAgentFilters } from "../../hooks/use-agents-filter";
import { DataPagination } from "../components/data-pagination";

export const AgentsView = () => {
	const [filters, setFilters] = useAgentFilters();
	const trpc = useTRPC();
	const { data } = useSuspenseQuery(
		trpc.agents.getMany.queryOptions({ ...filters })
	);

	return (
		<div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
			<DataTable data={data.items} columns={columns} />
			<DataPagination
				page={filters.page}
				totalPages={data.totalPages}
				onPageChange={(page) => setFilters({ page })}
			/>
			{data.items.length === 0 && (
				<EmtpyState
					title="Create your first agent"
					description="Create your agents to join meetings. Each agents will follow your instructions and can interact with participants during the call."
				/>
			)}
		</div>
	);
};

export const AgentsViewLoading = () => {
	return (
		<LoadingState
			title="Loading Agents"
			description="Grabbing a cup of tea"
		/>
	);
};

export const AgentsViewError = () => {
	return (
		<ErrorState
			title="Error Loading Agents"
			description="Something went wrong"
		/>
	);
};
