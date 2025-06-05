import { EmtpyState } from "@/components/empty-state";

export const CancelledState = () => {
	return (
		<div className="bg-white rounded-lg px-4 py-5 flex flex-col gap-y-8 items-center justify-center">
			<EmtpyState
				image="/cancelled.svg"
				title="Meeting cancelled"
				description="This meeting was cancelled."
			/>
		</div>
	);
};
