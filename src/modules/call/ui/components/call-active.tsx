"use client";
import {
	LiveKitRoom,
	VideoConference,
	type LocalUserChoices,
} from "@livekit/components-react";
import "@livekit/components-styles";
import Image from "next/image";
import Link from "next/link";

interface Props {
	meetingName: string;
	token: string;
	serverUrl: string;
	choices: LocalUserChoices;
	onLeave: () => void;
}

export const CallActive = ({
	meetingName,
	token,
	serverUrl,
	choices,
	onLeave,
}: Props) => {
	return (
		<LiveKitRoom
			token={token}
			serverUrl={serverUrl}
			connect
			audio={choices.audioEnabled}
			video={choices.videoEnabled}
			onDisconnected={onLeave}
			data-lk-theme="default"
			style={{ height: "100%" }}>
			<div className="flex flex-col h-full text-white">
				<div className="bg-[#101213] rounded-full p-4 flex items-center gap-4 m-4">
					<Link
						href="/"
						className="flex items-center justify-center p-1 bg-white/10 rounded-full w-fit">
						<Image src="/logo.svg" width={22} height={22} alt="Logo" />
					</Link>
					<h4 className="text-base">{meetingName}</h4>
				</div>
				<div className="flex-1 min-h-0">
					<VideoConference />
				</div>
			</div>
		</LiveKitRoom>
	);
};
