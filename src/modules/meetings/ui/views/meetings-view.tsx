"use client";

import { DataTable } from "@/components/data-table";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { EmtpyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filter";
import { DataPagination } from "@/components/data-pagination";

export const MeetingsView = () => {
	const trpc = useTRPC();
	const router = useRouter();
	const [filters, setFilters] = useMeetingsFilters();
	const { data } = useSuspenseQuery(
		trpc.meetings.getMany.queryOptions({
			...filters,
		})
	);

	return (
		<div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
			<DataTable
				data={data.items}
				columns={columns}
				onRowClick={(row) => router.push(`/meetings/${row.id}`)}
			/>
			<DataPagination
				page={filters.page}
				totalPages={data.totalPages}
				onPageChange={(page) => setFilters({ page })}
			/>
			{data.items.length === 0 && (
				<EmtpyState
					title="Create your first meeting"
					description="Create your first meeting to call connect your agent or freinds."
				/>
			)}
		</div>
	);
};

export const MeetingsViewLoading = () => {
	return (
		<LoadingState
			title="Loading Meetings"
			description="Grabbing a cup of tea"
		/>
	);
};

export const MeetingsViewError = () => {
	return (
		<ErrorState
			title="Error Loading Meetings"
			description="Something went wrong"
		/>
	);
};
