"use client";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { MeetingIdHeaderView } from "./meeting-id-header-view";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog copy";
import { useState } from "react";

interface Props {
	meetingId: string;
}

export const MeetingIdView = ({ meetingId }: Props) => {
	const trpc = useTRPC();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data } = useSuspenseQuery(
		trpc.meetings.getOne.queryOptions({ id: meetingId })
	);

	const [RemoveConfirmation, confirmRemove] = useConfirm(
		"Are you Sure?",
		"The following action will remove the meeting."
	);

	const [updateMeetingDialogOpen, setUpdateMeetingDialogOpen] =
		useState(false);

	const removeMeeting = useMutation(
		trpc.meetings.remove.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries(
					trpc.meetings.getMany.queryOptions({})
				);
				router.push("/meetings");
			},
		})
	);

	const handleRemoveMeeting = async () => {
		const ok = await confirmRemove();

		if (!ok) return;

		await removeMeeting.mutateAsync({ id: meetingId });
	};

	return (
		<>
			<RemoveConfirmation />
			<UpdateMeetingDialog
				open={updateMeetingDialogOpen}
				onOpenChange={setUpdateMeetingDialogOpen}
				initialValues={data}
			/>
			<div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
				<MeetingIdHeaderView
					meetingId={meetingId}
					meetingName={data.name}
					onEdit={() => setUpdateMeetingDialogOpen(true)}
					onRemove={handleRemoveMeeting}
				/>
				{JSON.stringify(data, null, 2)}
			</div>
		</>
	);
};

export const MeetingIdViewLoading = () => {
	return (
		<LoadingState
			title="Loading Meeting"
			description="Grabbing a Meeting for you"
		/>
	);
};

export const MeetingIdViewError = () => {
	return (
		<ErrorState
			title="Error Loading Meeting"
			description="Something went wrong"
		/>
	);
};
