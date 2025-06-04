import {
	MeetingsView,
	MeetingsViewError,
	MeetingsViewLoading,
} from "@/modules/meetings/ui/meetings-view";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const page = () => {
	const queryClient = getQueryClient();
	void queryClient.prefetchQuery(trpc.meetings.getMany.queryOptions({}));
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<Suspense fallback={<MeetingsViewLoading />}>
				<ErrorBoundary fallback={<MeetingsViewError />}>
					<MeetingsView />
				</ErrorBoundary>
			</Suspense>
		</HydrationBoundary>
	);
};

export default page;
