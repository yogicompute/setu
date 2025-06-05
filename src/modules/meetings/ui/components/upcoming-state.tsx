import { EmtpyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { BanIcon, VideoIcon } from "lucide-react";
import Link from "next/link";

interface Props {
	meetingId: string;
	onCancelMeeting: () => void;
	isCancelling: boolean;
}

export const UpcomingState = ({
	meetingId,
	onCancelMeeting,
	isCancelling,
}: Props) => {
	return (
		<div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
			<EmtpyState
				image="/upcoming.svg"
				title="Not started yet"
				description="Once you start the meeting, a summary will appear here"
			/>
			<div className="flex flex-col-reverse lg:flex-row lg:justify-center items-center gap-2 w-full">
				<Button
					onClick={onCancelMeeting}
					variant="secondary"
					disabled={isCancelling}
					className="w-full lg:w-auto">
					<BanIcon />
					Cancel meeting
				</Button>
				<Button
					disabled={isCancelling}
					asChild
					className="w-full lg:w-auto">
					<Link href={`/call/${meetingId}`}>
						<VideoIcon />
						Start meeting
					</Link>
				</Button>
			</div>
		</div>
	);
};
