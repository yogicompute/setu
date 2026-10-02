"use client";
import { PreJoin, type LocalUserChoices } from "@livekit/components-react";
import "@livekit/components-styles";

interface Props {
	userName: string;
	onJoin: (choices: LocalUserChoices) => void;
}

export const CallLobby = ({ userName, onJoin }: Props) => {
	return (
		<div className="flex flex-col items-center justify-center h-full bg-radial from-sidebar-accent to-sidebar">
			<div className="py-4 px-8 flex flex-1 items-center justify-center">
				<div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
					<div className="flex flex-col gap-y-2 text-center">
						<h6 className="text-lg font-medium">Ready to join?</h6>
						<p className="text-sm">Set up your call before joining</p>
					</div>
					{/* LiveKit PreJoin handles camera/mic preview, device
					    selection and browser permissions out of the box. */}
					<div data-lk-theme="default" className="w-full">
						<PreJoin
							defaults={{
								username: userName,
								videoEnabled: true,
								audioEnabled: true,
							}}
							onSubmit={onJoin}
							joinLabel="Join Call"
							persistUserChoices
						/>
					</div>
				</div>
			</div>
		</div>
	);
};
